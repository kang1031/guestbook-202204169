import { neon } from "@neondatabase/serverless";
import type { Entry, EntryStore } from "./types";

type EntryRow = {
  id: string | number;
  author_name: string;
  message: string;
  created_at: string | Date;
  updated_at: string | Date | null;
};

const toEntry = (row: EntryRow): Entry => ({
  id: Number(row.id),
  authorName: row.author_name,
  message: row.message,
  createdAt: new Date(row.created_at),
  updatedAt: row.updated_at === null ? null : new Date(row.updated_at),
});

/** EntryStore backed by Neon Postgres. All values are bound as query parameters. */
export function createNeonEntryStore(databaseUrl: string): EntryStore {
  const sql = neon(databaseUrl);

  return {
    async list() {
      const rows = await sql`
        SELECT id, author_name, message, created_at, updated_at
        FROM entries
        ORDER BY created_at DESC, id DESC`;
      return (rows as EntryRow[]).map(toEntry);
    },

    async insert({ authorName, message, passwordHash, createdAt }) {
      const rows = await sql`
        INSERT INTO entries (author_name, message, password_hash, created_at)
        VALUES (${authorName}, ${message}, ${passwordHash}, ${createdAt.toISOString()})
        RETURNING id, author_name, message, created_at, updated_at`;
      return toEntry(rows[0] as EntryRow);
    },

    async findPasswordHash(id) {
      const rows = await sql`SELECT password_hash FROM entries WHERE id = ${id}`;
      return (rows[0]?.password_hash as string | undefined) ?? null;
    },

    async updateMessage(id, message, updatedAt) {
      const rows = await sql`
        UPDATE entries
        SET message = ${message}, updated_at = ${updatedAt.toISOString()}
        WHERE id = ${id}
        RETURNING id`;
      return rows.length > 0;
    },

    async delete(id) {
      const rows = await sql`DELETE FROM entries WHERE id = ${id} RETURNING id`;
      return rows.length > 0;
    },
  };
}
