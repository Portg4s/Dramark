const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';

type PagesFunctionContext = {
  request: Request;
  env: {
    TMDB_ACCESS_TOKEN?: string;
  };
};

const allowedTmdbPathPatterns = [
  /^\/search\/multi$/,
  /^\/trending\/all\/week$/,
  /^\/discover\/movie$/,
  /^\/discover\/tv$/,
  /^\/movie\/\d+$/,
  /^\/tv\/\d+$/,
  /^\/tv\/\d+\/season\/\d+$/
] as const;

function jsonResponse(body: unknown, init: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers
    }
  });
}

export function isAllowedTmdbPath(pathname: string): boolean {
  return allowedTmdbPathPatterns.some((pattern) => pattern.test(pathname));
}

export function getTmdbPath(requestUrl: string): string | undefined {
  const { pathname } = new URL(requestUrl);
  const tmdbPath = pathname.replace(/^\/api\/tmdb/, '') || '/';

  return isAllowedTmdbPath(tmdbPath) ? tmdbPath : undefined;
}

export function buildTmdbUrl(requestUrl: string): string | undefined {
  const request = new URL(requestUrl);
  const tmdbPath = getTmdbPath(requestUrl);

  if (!tmdbPath) {
    return undefined;
  }

  const upstream = new URL(`${TMDB_API_BASE_URL}${tmdbPath}`);
  request.searchParams.forEach((value, key) => {
    upstream.searchParams.append(key, value);
  });

  return upstream.toString();
}

export async function onRequest(context: PagesFunctionContext): Promise<Response> {
  if (context.request.method !== 'GET') {
    return jsonResponse(
      { error: 'Method not allowed.' },
      { status: 405, headers: { Allow: 'GET' } }
    );
  }

  const token = context.env.TMDB_ACCESS_TOKEN?.trim();

  if (!token) {
    return jsonResponse({ error: 'TMDB proxy is not configured.' }, { status: 500 });
  }

  const upstreamUrl = buildTmdbUrl(context.request.url);

  if (!upstreamUrl) {
    return jsonResponse({ error: 'Not found.' }, { status: 404 });
  }

  const upstreamResponse = await fetch(upstreamUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    }
  });
  const body = await upstreamResponse.text();

  return new Response(body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: {
      'Content-Type': upstreamResponse.headers.get('Content-Type') ?? 'application/json'
    }
  });
}
