import { useQuery } from '@tanstack/react-query';

import { tmdbClient } from '@/services/tmdb/client';
import { tmdbRuntimeConfig } from '@/services/tmdb/config';
import { searchMoviesAndTv } from '@/services/tmdb/search';

export const searchQueryKeys = {
  all: ['search'] as const,
  tmdb: (query: string) => [...searchQueryKeys.all, 'tmdb', query] as const
};

export function useTmdbMediaSearch(query: string) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: searchQueryKeys.tmdb(normalizedQuery),
    queryFn: () => searchMoviesAndTv(tmdbClient, normalizedQuery),
    enabled: tmdbRuntimeConfig.isConfigured && normalizedQuery.length >= 2,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 30,
    retry: 1
  });
}
