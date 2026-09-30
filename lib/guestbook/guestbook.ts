import { hashPassword, verifyPassword } from "./password";
import type { Entry, EntryStore } from "./types";
import { validate, type FieldErrors } from "./validation";

export type CreateEntryInput = {
  authorName: string;
  message: string;
  password: string;
};

export type Invalid = { status: "invalid"; errors: FieldErrors };

export type WrongPassword = { status: "wrong-password" };
export type NotFound = { status: "not-found" };

export type CreateEntryResult = { status: "ok"; entry: Entry } | Invalid;

export type EditMessageInput = { id: number; message: string; password: string };
export type EditMessageResult = { status: "ok" } | Invalid | WrongPassword | NotFound;

export function createGuestbook({
  store,
  now = () => new Date(),
}: {
  store: EntryStore;
  now?: () => Date;
}) {
  /** Returns a refusal when the Entry is missing or the password is wrong, otherwise `null`. */
  async function checkPassword(
    id: number,
    password: string,
  ): Promise<WrongPassword | NotFound | null> {
    const hash = Number.isSafeInteger(id) ? await store.findPasswordHash(id) : null;
    if (hash === null) return { status: "not-found" };
    if (!(await verifyPassword(password, hash))) return { status: "wrong-password" };
    return null;
  }

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

    /** Replaces an Entry's Message, only when the Entry password matches. */
    async editMessage(input: EditMessageInput): Promise<EditMessageResult> {
      const checked = validate({ message: input.message });
      if (!checked.ok) return { status: "invalid", errors: checked.errors };

      const denied = await checkPassword(input.id, input.password);
      if (denied) return denied;

      // The Entry may have been deleted between the check and the update.
      const updated = await store.updateMessage(input.id, checked.value.message, now());
      return updated ? { status: "ok" } : { status: "not-found" };
    },
  };
}

export type Guestbook = ReturnType<typeof createGuestbook>;
