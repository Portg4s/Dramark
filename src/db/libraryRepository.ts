import { db } from '@/db/dramarkDb';
import type { LibraryEntry, LibraryEntryRecord, MediaIdentity } from '@/types/media';
import { createMediaKey } from '@/utils/mediaKey';

export async function getLibraryEntry(identity: MediaIdentity): Promise<LibraryEntryRecord | undefined> {
  return db.library.get(createMediaKey(identity));
}

export async function upsertLibraryEntry(entry: LibraryEntry): Promise<string> {
  const record: LibraryEntryRecord = {
    ...entry,
    id: createMediaKey(entry)
  };

  await db.library.put(record);
  return record.id;
}

export async function removeLibraryEntry(identity: MediaIdentity): Promise<void> {
  await db.library.delete(createMediaKey(identity));
}
