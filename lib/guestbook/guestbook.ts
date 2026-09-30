import { hashPassword } from "./password";
import type { Entry, EntryStore } from "./types";
import { validate, type FieldErrors } from "./validation";

export type CreateEntryInput = {
  authorName: string;
  message: string;
  password: string;
};

export type Invalid = { status: "invalid"; errors: FieldErrors };

export type CreateEntryResult = { status: "ok"; entry: Entry } | Invalid;

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

    async createEntry(input: CreateEntryInput): Promise<CreateEntryResult> {
      const checked = validate(input);
      if (!checked.ok) return { status: "invalid", errors: checked.errors };

      const { authorName, message, password } = checked.value;
      const entry = await store.insert({
        authorName,
        message,
        passwordHash: await hashPassword(password),
        createdAt: now(),
      });
      return { status: "ok", entry };
    },
  };
}

export type Guestbook = ReturnType<typeof createGuestbook>;
