import "server-only";
import { createGuestbook, type Guestbook } from "./guestbook";
import { createNeonEntryStore } from "./neon-store";

let guestbook: Guestbook | undefined;

/** The production Guestbook, backed by Neon. Server-only. */
export function getGuestbook(): Guestbook {
  if (!guestbook) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set.");
    guestbook = createGuestbook({ store: createNeonEntryStore(url) });
  }
  return guestbook;
}

export type { Entry } from "./types";
