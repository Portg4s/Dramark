import { db } from '@/db/dramarkDb';
import {
  createTvProgress,
  getTvViewingState,
  normalizeWatchedEpisodes,
  parseEpisodeKey
} from '@/features/media/tvProgress';
import type {
  LibraryActivityAction,
  LibraryActivityRecord,
  LibraryEntry,
  LibraryEntryRecord,
  LibraryStatus,
  LocalMediaSnapshot,
  MediaIdentity,
  TvSeasonProgressMeta
} from '@/types/media';
import { createMediaKey } from '@/utils/mediaKey';

export type LibraryTable = {
  get(key: string): Promise<LibraryEntryRecord | undefined>;
  put(record: LibraryEntryRecord): Promise<unknown>;
  delete(key: string): Promise<void>;
  toArray(): Promise<LibraryEntryRecord[]>;
};

export type LibraryActivityTable = {
  add(record: LibraryActivityRecord): Promise<unknown>;
  toArray(): Promise<LibraryActivityRecord[]>;
};

export type SetLibraryStatusInput = MediaIdentity & {
  status: LibraryStatus;
  snapshot?: LocalMediaSnapshot;
  now?: string;
};

export type SetTvProgressInput = MediaIdentity & {
  seasons: TvSeasonProgressMeta[];
  watchedEpisodes: string[];
  snapshot?: LocalMediaSnapshot;
  now?: string;
};

function createRecord(entry: LibraryEntry): LibraryEntryRecord {
  return {
    ...entry,
    id: createMediaKey(entry)
  };
}

function createActivityId(input: {
  action: LibraryActivityAction;
  createdAt: string;
  mediaType: MediaIdentity['mediaType'];
  tmdbId: number;
  episodeKey?: string;
}): string {
  const randomPart =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return [
    input.createdAt,
    input.action,
    input.mediaType,
    input.tmdbId,
    input.episodeKey ?? 'media',
    randomPart
  ].join(':');
}

function createActivityRecord(
  input: SetLibraryStatusInput | SetTvProgressInput,
  action: LibraryActivityAction,
  episodeKey?: string
): LibraryActivityRecord {
  const createdAt = input.now ?? new Date().toISOString();
  const episodePosition = episodeKey ? parseEpisodeKey(episodeKey) : undefined;

  return {
    id: createActivityId({
      action,
      createdAt,
      mediaType: input.mediaType,
      tmdbId: input.tmdbId,
      episodeKey
    }),
    action,
    mediaType: input.mediaType,
    tmdbId: input.tmdbId,
    createdAt,
    snapshot: input.snapshot,
    episodeKey,
    seasonNumber: episodePosition?.seasonNumber,
    episodeNumber: episodePosition?.episodeNumber
  };
}

function getNewWatchedEpisodeKeys(
  existing: LibraryEntryRecord | undefined,
  nextWatchedEpisodes: string[]
): string[] {
  const previousWatchedEpisodes = new Set(existing?.tvProgress?.watchedEpisodes ?? []);

  return nextWatchedEpisodes.filter((episodeKey) => !previousWatchedEpisodes.has(episodeKey));
}

function applyLibraryStatus(
  existing: LibraryEntryRecord | undefined,
  input: SetLibraryStatusInput
): LibraryEntryRecord {
  const now = input.now ?? new Date().toISOString();
  const base = {
    mediaType: input.mediaType,
    tmdbId: input.tmdbId,
    status: input.status,
    addedAt: existing?.addedAt ?? now,
    updatedAt: now,
    snapshot: input.snapshot ?? existing?.snapshot
  };

  return createRecord(
    input.status === 'watched'
      ? {
          ...base,
          watchedAt: now
        }
      : base
  );
}

function applyTvProgress(
  existing: LibraryEntryRecord | undefined,
  input: SetTvProgressInput
): LibraryEntryRecord {
  const now = input.now ?? new Date().toISOString();
  const watchedEpisodes = normalizeWatchedEpisodes(input.watchedEpisodes, input.seasons);
  const tvProgress = createTvProgress(watchedEpisodes, input.seasons, now);
  const base = {
    mediaType: input.mediaType,
    tmdbId: input.tmdbId,
    addedAt: existing?.addedAt ?? now,
    updatedAt: now,
    snapshot: input.snapshot ?? existing?.snapshot,
    tvProgress
  };
  const virtualEntry = createRecord({
    ...base,
    status: 'watchlist'
  });
  const viewingState = getTvViewingState(virtualEntry, input.seasons);

  return createRecord(
    viewingState === 'watched'
      ? {
          ...base,
          status: 'watched',
          watchedAt: now
        }
      : {
          ...base,
          status: 'watchlist'
        }
  );
}

export function createLibraryRepository(table: LibraryTable, activityTable?: LibraryActivityTable) {
  async function recordActivity(activity: LibraryActivityRecord) {
    if (!activityTable) {
      return;
    }

    await activityTable.add(activity);
  }

  return {
    async get(identity: MediaIdentity): Promise<LibraryEntryRecord | undefined> {
      return table.get(createMediaKey(identity));
    },

    async listAll(): Promise<LibraryEntryRecord[]> {
      return table.toArray();
    },

    async listByStatus(status: LibraryStatus): Promise<LibraryEntryRecord[]> {
      const entries = await table.toArray();
      return entries.filter((entry) => entry.status === status);
    },

    async upsert(entry: LibraryEntry): Promise<string> {
      const record = createRecord(entry);
      await table.put(record);
      return record.id;
    },

    async setStatus(input: SetLibraryStatusInput): Promise<LibraryEntryRecord> {
      const id = createMediaKey(input);
      const existing = await table.get(id);
      const record = applyLibraryStatus(existing, input);
      await table.put(record);

      if (input.status === 'watched' && existing?.status !== 'watched') {
        await recordActivity(createActivityRecord(input, 'media_watched'));
      } else if (input.status === 'watchlist' && !existing) {
        await recordActivity(createActivityRecord(input, 'media_watchlist_added'));
      }

      return record;
    },

    async setTvProgress(input: SetTvProgressInput): Promise<LibraryEntryRecord> {
      const id = createMediaKey(input);
      const existing = await table.get(id);
      const record = applyTvProgress(existing, input);
      await table.put(record);

      const newEpisodeKeys = getNewWatchedEpisodeKeys(
        existing,
        record.tvProgress?.watchedEpisodes ?? []
      ).slice(-5);

      for (const episodeKey of newEpisodeKeys) {
        await recordActivity(createActivityRecord(input, 'episode_watched', episodeKey));
      }

      return record;
    },

    async remove(identity: MediaIdentity): Promise<void> {
      await table.delete(createMediaKey(identity));
    },

    async listActivity(limit = 12): Promise<LibraryActivityRecord[]> {
      if (!activityTable) {
        return [];
      }

      const entries = await activityTable.toArray();

      return entries
        .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
        .slice(0, limit);
    }
  };
}

export const libraryRepository = createLibraryRepository(db.library, db.activity);

export async function getLibraryEntry(
  identity: MediaIdentity
): Promise<LibraryEntryRecord | undefined> {
  return libraryRepository.get(identity);
}

export async function listLibraryEntries(): Promise<LibraryEntryRecord[]> {
  return libraryRepository.listAll();
}

export async function listLibraryEntriesByStatus(
  status: LibraryStatus
): Promise<LibraryEntryRecord[]> {
  return libraryRepository.listByStatus(status);
}

export async function upsertLibraryEntry(entry: LibraryEntry): Promise<string> {
  return libraryRepository.upsert(entry);
}

export async function setLibraryEntryStatus(
  input: SetLibraryStatusInput
): Promise<LibraryEntryRecord> {
  return libraryRepository.setStatus(input);
}

export async function setLibraryEntryTvProgress(
  input: SetTvProgressInput
): Promise<LibraryEntryRecord> {
  return libraryRepository.setTvProgress(input);
}

export async function removeLibraryEntry(identity: MediaIdentity): Promise<void> {
  return libraryRepository.remove(identity);
}

export async function listLibraryActivity(limit?: number): Promise<LibraryActivityRecord[]> {
  return libraryRepository.listActivity(limit);
}
