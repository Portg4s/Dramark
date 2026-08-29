import Dexie, { type Table } from 'dexie';

import type { LibraryActivityRecord, LibraryEntryRecord } from '@/types/media';

export class DramarkDatabase extends Dexie {
  activity!: Table<LibraryActivityRecord, string>;
  library!: Table<LibraryEntryRecord, string>;

  constructor() {
    super('dramark');

    this.version(1).stores({
      library: '&id, status, addedAt, updatedAt, [mediaType+tmdbId]'
    });

    this.version(2).stores({
      activity: '&id, createdAt, action, [mediaType+tmdbId]',
      library: '&id, status, addedAt, updatedAt, [mediaType+tmdbId]'
    });
  }
}

export const db = new DramarkDatabase();
