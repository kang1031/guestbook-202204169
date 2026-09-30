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

const valid = { authorName: "철수", message: "안녕하세요", password: "1234" };

describe("writing an entry", () => {
  it("adds the entry to the top of the list", async () => {
    const { guestbook, clock } = setup();
    await guestbook.createEntry(valid);
    clock.advance(1);

    const result = await guestbook.createEntry({ ...valid, message: "새 글" });

    expect(result.status).toBe("ok");
    const [top] = await guestbook.listEntries();
    expect(top).toMatchObject({ authorName: "철수", message: "새 글", updatedAt: null });
  });

  it("trims the author name and message but keeps inner line breaks", async () => {
    const { guestbook } = setup();

    await guestbook.createEntry({ ...valid, authorName: "  철수  ", message: "\n 첫 줄\n둘째 줄 \n" });

    const [entry] = await guestbook.listEntries();
    expect(entry.authorName).toBe("철수");
    expect(entry.message).toBe("첫 줄\n둘째 줄");
  });

  it("never exposes the password in what it returns", async () => {
    const { guestbook } = setup();

    const result = await guestbook.createEntry({ ...valid, password: "secret-pw" });
    const listed = await guestbook.listEntries();

    expect(JSON.stringify([result, listed])).not.toMatch(/secret-pw|scrypt|password/i);
  });

  it.each([
    ["an empty author name", { authorName: "" }, "authorName"],
    ["a whitespace-only author name", { authorName: "   " }, "authorName"],
    ["a 21-character author name", { authorName: "가".repeat(21) }, "authorName"],
    ["an empty message", { message: "" }, "message"],
    ["a whitespace-only message", { message: " \n\t " }, "message"],
    ["a 501-character message", { message: "a".repeat(501) }, "message"],
    ["a 3-character password", { password: "123" }, "password"],
    ["a 73-character password", { password: "p".repeat(73) }, "password"],
  ] as const)("rejects %s", async (_, override, field) => {
    const { guestbook } = setup();

    const result = await guestbook.createEntry({ ...valid, ...override });

    expect(result.status).toBe("invalid");
    expect(result.status === "invalid" && Object.keys(result.errors)).toEqual([field]);
    expect(await guestbook.listEntries()).toEqual([]);
  });

  it.each([
    ["a 20-character author name", { authorName: "가".repeat(20) }],
    ["a 500-character message", { message: "a".repeat(500) }],
    ["a 4-character password", { password: "1234" }],
    ["a 72-character password", { password: "p".repeat(72) }],
    ["an emoji name counted as visible characters", { authorName: "👨‍👩‍👧".repeat(20) }],
  ] as const)("accepts %s", async (_, override) => {
    const { guestbook } = setup();

    const result = await guestbook.createEntry({ ...valid, ...override });

    expect(result.status).toBe("ok");
  });

  it("reports every invalid field at once", async () => {
    const { guestbook } = setup();

    const result = await guestbook.createEntry({ authorName: "", message: "", password: "" });

    expect(result.status === "invalid" && Object.keys(result.errors).sort()).toEqual([
      "authorName",
      "message",
      "password",
    ]);
  });
});

async function writeEntry(guestbook: ReturnType<typeof setup>["guestbook"], input = valid) {
  const result = await guestbook.createEntry(input);
  if (result.status !== "ok") throw new Error("setup entry was rejected");
  return result.entry;
}

describe("editing a message", () => {
  it("changes the message and marks it edited when the password matches", async () => {
    const { guestbook, clock } = setup();
    const entry = await writeEntry(guestbook);
    clock.advance(5);

    const result = await guestbook.editMessage({ id: entry.id, message: "고친 글", password: "1234" });

    expect(result.status).toBe("ok");
    const [edited] = await guestbook.listEntries();
    expect(edited.message).toBe("고친 글");
    expect(edited.createdAt).toEqual(entry.createdAt);
    expect(edited.updatedAt).toEqual(new Date("2026-09-30T05:05:00Z"));
  });

  it("keeps the entry in its original place in the list", async () => {
    const { guestbook, clock } = setup();
    const older = await writeEntry(guestbook, { ...valid, message: "오래된 글" });
    clock.advance(1);
    await writeEntry(guestbook, { ...valid, message: "최신 글" });
    clock.advance(1);

    await guestbook.editMessage({ id: older.id, message: "오래된 글 (수정)", password: "1234" });

    const entries = await guestbook.listEntries();
    expect(entries.map((e) => e.message)).toEqual(["최신 글", "오래된 글 (수정)"]);
  });

  it("refuses a wrong password and leaves the message untouched", async () => {
    const { guestbook } = setup();
    const entry = await writeEntry(guestbook);

    const result = await guestbook.editMessage({ id: entry.id, message: "해킹", password: "0000" });

    expect(result.status).toBe("wrong-password");
    const [unchanged] = await guestbook.listEntries();
    expect(unchanged).toMatchObject({ message: "안녕하세요", updatedAt: null });
  });

  it("does not accept the password of another entry with the same author name", async () => {
    const { guestbook } = setup();
    const mine = await writeEntry(guestbook, { ...valid, password: "mine-pw" });
    await writeEntry(guestbook, { ...valid, password: "other-pw" });

    const result = await guestbook.editMessage({ id: mine.id, message: "x", password: "other-pw" });

    expect(result.status).toBe("wrong-password");
  });

  it("reports an entry that no longer exists", async () => {
    const { guestbook } = setup();

    const result = await guestbook.editMessage({ id: 999, message: "x", password: "1234" });

    expect(result.status).toBe("not-found");
  });

  it.each([
    ["an empty message", ""],
    ["a 501-character message", "a".repeat(501)],
  ])("rejects %s", async (_, message) => {
    const { guestbook } = setup();
    const entry = await writeEntry(guestbook);

    const result = await guestbook.editMessage({ id: entry.id, message, password: "1234" });

    expect(result.status === "invalid" && Object.keys(result.errors)).toEqual(["message"]);
    const [unchanged] = await guestbook.listEntries();
    expect(unchanged.message).toBe("안녕하세요");
  });
});

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
