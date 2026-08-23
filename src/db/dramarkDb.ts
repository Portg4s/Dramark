import Dexie, { type Table } from 'dexie';

import type { LibraryEntryRecord } from '@/types/media';

export class DramarkDatabase extends Dexie {
  library!: Table<LibraryEntryRecord, string>;

  constructor() {
    super('dramark');

    this.version(1).stores({
      library: '&id, status, addedAt, updatedAt, [mediaType+tmdbId]'
    });
  }
}

export const db = new DramarkDatabase();
