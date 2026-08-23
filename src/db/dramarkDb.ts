import Dexie, { type Table } from 'dexie';

import type { LibraryEntryRecord, MediaType } from '@/types/media';

export type ProviderAvailabilityCacheRecord = {
  id: string;
  mediaType: MediaType;
  tmdbId: number;
  providerName: string;
  region: 'FR';
  available: boolean;
  checkedAt: string;
};

export class DramarkDatabase extends Dexie {
  library!: Table<LibraryEntryRecord, string>;
  providerAvailabilityChecks!: Table<ProviderAvailabilityCacheRecord, string>;

  constructor() {
    super('dramark');

    this.version(1).stores({
      library: '&id, status, addedAt, updatedAt, [mediaType+tmdbId]',
      providerAvailabilityChecks: '&id, mediaType, tmdbId, providerName, checkedAt, available'
    });
  }
}

export const db = new DramarkDatabase();
