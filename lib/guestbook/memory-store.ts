import type { Entry, EntryStore } from "./types";

type Row = Entry & { passwordHash: string };

/** In-memory EntryStore for tests. */
export function createMemoryEntryStore(): EntryStore {
  const rows = new Map<number, Row>();
  let nextId = 1;

  const toEntry = (row: Row): Entry => ({
    id: row.id,
    authorName: row.authorName,
    message: row.message,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });

  return {
    async list() {
      return [...rows.values()].map(toEntry);
    },
    async insert(entry) {
      const row: Row = { id: nextId++, updatedAt: null, ...entry };
      rows.set(row.id, row);
      return toEntry(row);
    },
    async findPasswordHash(id) {
      return rows.get(id)?.passwordHash ?? null;
    },
    async updateMessage(id, message, updatedAt) {
      const row = rows.get(id);
      if (!row) return false;
      rows.set(id, { ...row, message, updatedAt });
      return true;
    },
    async delete(id) {
      return rows.delete(id);
    },
  };
}
