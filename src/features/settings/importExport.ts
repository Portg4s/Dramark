import { libraryRepository } from '@/db/libraryRepository';
import type { createLibraryRepository } from '@/db/libraryRepository';
import { libraryExportSchema, type LibraryExport } from '@/types/importExport';
import type { LibraryEntry, LibraryEntryRecord } from '@/types/media';

type LibraryRepository = ReturnType<typeof createLibraryRepository>;

export type LibraryImportResult = {
  importedCount: number;
  skippedCount: number;
};

function stripDatabaseId(entry: LibraryEntryRecord): LibraryEntry {
  const exportableEntry: LibraryEntry = {
    mediaType: entry.mediaType,
    tmdbId: entry.tmdbId,
    status: entry.status,
    addedAt: entry.addedAt,
    updatedAt: entry.updatedAt
  };

  if (entry.watchedAt) {
    exportableEntry.watchedAt = entry.watchedAt;
  }

  if (entry.snapshot) {
    exportableEntry.snapshot = entry.snapshot;
  }

  if (entry.tvProgress) {
    exportableEntry.tvProgress = entry.tvProgress;
  }

  return exportableEntry;
}

export function createLibraryExport(
  entries: LibraryEntryRecord[],
  exportedAt = new Date().toISOString()
): LibraryExport {
  return libraryExportSchema.parse({
    version: 1,
    exportedAt,
    entries: entries.map(stripDatabaseId)
  });
}

export function parseLibraryExport(content: string): LibraryExport {
  try {
    return libraryExportSchema.parse(JSON.parse(content));
  } catch {
    throw new Error('Fichier Dramark invalide');
  }
}

export async function exportLibraryData(repository: LibraryRepository = libraryRepository) {
  const entries = await repository.listAll();
  return JSON.stringify(createLibraryExport(entries), null, 2);
}

export async function importLibraryData(
  content: string,
  repository: LibraryRepository = libraryRepository
): Promise<LibraryImportResult> {
  const data = parseLibraryExport(content);
  let importedCount = 0;
  let skippedCount = 0;

  for (const entry of data.entries) {
    const existing = await repository.get(entry);

    if (existing) {
      skippedCount += 1;
      continue;
    }

    await repository.upsert(entry);
    importedCount += 1;
  }

  return { importedCount, skippedCount };
}
