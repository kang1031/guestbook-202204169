import type { Entry, EntryStore } from "./types";

export type CreateEntryInput = {
  authorName: string;
  message: string;
  password: string;
};

export function createGuestbook({
  store,
  now = () => new Date(),
}: {
  store: EntryStore;
  now?: () => Date;
}) {
  return {
    /** All Entries, newest first by the time they were written. */
    async listEntries(): Promise<Entry[]> {
      const entries = await store.list();
      return entries.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime() || b.id - a.id,
      );
    },

    async createEntry(input: CreateEntryInput) {
      const entry = await store.insert({
        authorName: input.authorName,
        message: input.message,
        passwordHash: input.password,
        createdAt: now(),
      });
      return { status: "ok" as const, entry };
    },
  };
}

export type Guestbook = ReturnType<typeof createGuestbook>;
