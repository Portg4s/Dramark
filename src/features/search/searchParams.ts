export function normalizeSearchQuery(value: string | null | undefined): string {
  return value?.trim() ?? '';
}

export function createSearchParamsForQuery(query: string): URLSearchParams {
  const params = new URLSearchParams();
  const normalizedQuery = normalizeSearchQuery(query);

  if (normalizedQuery) {
    params.set('q', query);
  }

  return params;
}
