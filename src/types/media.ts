export type MediaType = 'movie' | 'tv';

export type LibraryStatus = 'watchlist' | 'watched';

export type MediaIdentity = {
  mediaType: MediaType;
  tmdbId: number;
};

export type LocalMediaSnapshot = {
  title: string;
  posterPath?: string;
  releaseYear?: number;
  primaryCountry?: string;
  voteAverage?: number;
};

export type TvSeasonProgressMeta = {
  seasonNumber: number;
  episodeCount: number;
};

export type TvProgress = {
  watchedEpisodes: string[];
  seasons: TvSeasonProgressMeta[];
  updatedAt: string;
};

export type LibraryEntry = MediaIdentity & {
  status: LibraryStatus;
  addedAt: string;
  updatedAt: string;
  watchedAt?: string;
  snapshot?: LocalMediaSnapshot;
  tvProgress?: TvProgress;
};

export type LibraryEntryRecord = LibraryEntry & {
  id: string;
};
