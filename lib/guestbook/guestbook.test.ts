import { describe, expect, it } from "vitest";
import { createGuestbook } from "./guestbook";
import { createMemoryEntryStore } from "./memory-store";

function setup() {
  let now = new Date("2026-09-30T05:00:00Z");
  const clock = {
    now: () => now,
    advance: (minutes: number) => {
      now = new Date(now.getTime() + minutes * 60_000);
    },
  };
  const guestbook = createGuestbook({
    store: createMemoryEntryStore(),
    now: clock.now,
  });
  return { guestbook, clock };
}

describe("listing entries", () => {
  it("lists entries newest first", async () => {
    const { guestbook, clock } = setup();
    await guestbook.createEntry({ authorName: "철수", message: "첫 글", password: "1111" });
    clock.advance(1);
    await guestbook.createEntry({ authorName: "영희", message: "두 번째 글", password: "2222" });

    const entries = await guestbook.listEntries();

    expect(entries.map((e) => e.message)).toEqual(["두 번째 글", "첫 글"]);
  });
});
