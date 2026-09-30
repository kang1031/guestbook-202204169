/** One item in the guestbook, as shown to anyone. Never carries the password. */
export type Entry = {
  id: number;
  authorName: string;
  message: string;
  createdAt: Date;
  /** `null` until the Message has been edited at least once. */
  updatedAt: Date | null;
};

export type NewStoredEntry = {
  authorName: string;
  message: string;
  passwordHash: string;
  createdAt: Date;
};

/** Persistence port for Entries. Implemented by Postgres in production and in memory in tests. */
export interface EntryStore {
  list(): Promise<Entry[]>;
  insert(entry: NewStoredEntry): Promise<Entry>;
  /** Returns `null` when no Entry has this id. */
  findPasswordHash(id: number): Promise<string | null>;
  /** Returns `false` when no Entry has this id. */
  updateMessage(id: number, message: string, updatedAt: Date): Promise<boolean>;
  /** Returns `false` when no Entry has this id. */
  delete(id: number): Promise<boolean>;
}
