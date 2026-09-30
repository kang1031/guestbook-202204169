import { connection } from "next/server";
import { getGuestbook } from "@/lib/guestbook";
import { formatSeoulTime } from "@/lib/format-date";
import { EntryForm } from "./entry-form";

export default async function Home() {
  // The guestbook changes on every write, so always render at request time.
  await connection();
  const entries = await getGuestbook().listEntries();

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
      <main className="flex w-full max-w-xl flex-col gap-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            미니 방명록
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            개발자 <span className="font-medium text-zinc-700 dark:text-zinc-200">강동헌</span>
            {" · "}
            학번 <span className="font-medium text-zinc-700 dark:text-zinc-200">202204169</span>
          </p>
        </header>

        <EntryForm />

        <section aria-label="방명록 글 목록" className="flex flex-col gap-3">
          {entries.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-zinc-300 px-6 py-12 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              아직 글이 없어요. 첫 글을 남겨 주세요!
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {entry.authorName}
                    </span>
                    <time
                      dateTime={entry.createdAt.toISOString()}
                      className="text-xs text-zinc-500 dark:text-zinc-400"
                    >
                      {formatSeoulTime(entry.createdAt)}
                    </time>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap break-words text-zinc-700 dark:text-zinc-300">
                    {entry.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
