import { z } from 'zod';

export const libraryExportSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string().datetime(),
  entries: z.array(
    z.object({
      mediaType: z.enum(['movie', 'tv']),
      tmdbId: z.number().int().positive(),
      status: z.enum(['watchlist', 'watched']),
      addedAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
      watchedAt: z.string().datetime().optional(),
      snapshot: z
        .object({
          title: z.string().min(1),
          posterPath: z.string().optional(),
          releaseYear: z.number().int().optional(),
          primaryCountry: z.string().optional()
        })
        .optional()
    })
  )
});

export type LibraryExport = z.infer<typeof libraryExportSchema>;
