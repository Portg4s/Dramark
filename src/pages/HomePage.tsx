import { AlertTriangle, Database, Sparkles } from 'lucide-react';

import { PageHeader } from '@/components/ui/PageHeader';
import { CatalogRail } from '@/features/catalog/CatalogRail';
import { useVikiCatalogHome } from '@/features/catalog/hooks';
import type { CatalogMedia } from '@/features/catalog/types';
import { MissingTmdbConfigurationError, TmdbRequestError } from '@/services/tmdb/errors';

function getCatalogErrorMessage(error: unknown): string {
  if (error instanceof MissingTmdbConfigurationError) {
    return 'Configuration TMDB absente. Ajoutez un token pour charger le catalogue.';
  }

  if (error instanceof TmdbRequestError) {
    return 'TMDB ne repond pas correctement pour le moment. Reessayez plus tard.';
  }

  if (error instanceof Error) {
    return 'Impossible de charger cette section pour le moment.';
  }

  return 'Une erreur inconnue bloque cette section.';
}

function getProviderMissingMessage(mediaType: CatalogMedia['mediaType']): string {
  return mediaType === 'movie'
    ? 'TMDB ne retourne pas Rakuten Viki France dans la liste des providers films.'
    : 'TMDB ne retourne pas Rakuten Viki France dans la liste des providers series.';
}

function HomeDiagnostics({
  movieProviderId,
  tvProviderId,
  movieTotal,
  tvTotal,
  moviePage,
  tvPage
}: {
  movieProviderId?: number;
  tvProviderId?: number;
  movieTotal?: number;
  tvTotal?: number;
  moviePage?: number;
  tvPage?: number;
}) {
  return (
    <div className="flex flex-wrap gap-2 text-[0.72rem] font-medium text-subtle">
      <span className="rounded-full border border-white/10 bg-white/7 px-3 py-1">
        Films : {movieProviderId ? `provider ${movieProviderId}` : 'provider introuvable'}
      </span>
      <span className="rounded-full border border-white/10 bg-white/7 px-3 py-1">
        Series : {tvProviderId ? `provider ${tvProviderId}` : 'provider introuvable'}
      </span>
      {movieTotal !== undefined ? (
        <span className="rounded-full border border-white/10 bg-white/7 px-3 py-1">
          Films page {moviePage ?? 1} : {movieTotal} resultats
        </span>
      ) : null}
      {tvTotal !== undefined ? (
        <span className="rounded-full border border-white/10 bg-white/7 px-3 py-1">
          Series page {tvPage ?? 1} : {tvTotal} resultats
        </span>
      ) : null}
    </div>
  );
}

export function HomePage() {
  const {
    isTmdbConfigured,
    providerResolution,
    tvRail,
    movieRail,
    popularMedia,
    tvMedia,
    movieMedia
  } = useVikiCatalogHome();
  const providerIds = providerResolution.data?.providerIds;
  const isProviderLoading = isTmdbConfigured && providerResolution.isLoading;
  const providerError = providerResolution.error;
  const isAnyCatalogLoading = tvRail.isLoading || movieRail.isLoading || isProviderLoading;
  const popularError =
    tvRail.error && movieRail.error ? getCatalogErrorMessage(tvRail.error) : undefined;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(135deg,rgba(255,79,135,0.20),rgba(91,141,239,0.12)_45%,rgba(255,255,255,0.05))] px-5 py-6 shadow-panel sm:px-8 sm:py-10">
        <div className="flex items-center gap-2 text-sm font-semibold text-viki-soft">
          <Sparkles aria-hidden="true" size={18} />
          Rakuten Viki France
        </div>
        <PageHeader
          title="Dramark"
          description="Decouvrez les films et series que TMDB signale comme disponibles sur Rakuten Viki en France, puis preparez votre liste personnelle."
        />
        <HomeDiagnostics
          movieProviderId={providerIds?.movie}
          tvProviderId={providerIds?.tv}
          movieTotal={movieRail.data?.totalResults}
          moviePage={movieRail.data?.page}
          tvTotal={tvRail.data?.totalResults}
          tvPage={tvRail.data?.page}
        />
      </section>

      {!isTmdbConfigured ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300/20 bg-amber-300/10 px-4 py-4 text-sm text-amber-100">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            Ajoutez un token TMDB local pour afficher les contenus reels du catalogue Viki France.
          </p>
        </div>
      ) : null}

      {providerError ? (
        <div className="flex items-start gap-3 rounded-lg border border-red-300/20 bg-red-300/10 px-4 py-4 text-sm text-red-100">
          <Database className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>{getCatalogErrorMessage(providerError)}</p>
        </div>
      ) : null}

      <CatalogRail
        title="Populaires sur Viki"
        action="TMDB / JustWatch"
        media={popularMedia}
        isLoading={isAnyCatalogLoading}
        errorMessage={popularError}
        emptyMessage="Aucun contenu populaire n'est retourne pour Rakuten Viki France pour le moment."
      />

      <CatalogRail
        title="Series a decouvrir"
        media={tvMedia}
        isLoading={isProviderLoading || tvRail.isLoading}
        errorMessage={
          providerResolution.data && !providerIds?.tv
            ? getProviderMissingMessage('tv')
            : tvRail.error
              ? getCatalogErrorMessage(tvRail.error)
              : undefined
        }
        emptyMessage="Aucune serie supplementaire n'est retournee pour cette page."
      />

      <CatalogRail
        title="Films a decouvrir"
        media={movieMedia}
        isLoading={isProviderLoading || movieRail.isLoading}
        errorMessage={
          providerResolution.data && !providerIds?.movie
            ? getProviderMissingMessage('movie')
            : movieRail.error
              ? getCatalogErrorMessage(movieRail.error)
              : undefined
        }
        emptyMessage="Aucun film supplementaire n'est retourne pour cette page."
      />
    </div>
  );
}
