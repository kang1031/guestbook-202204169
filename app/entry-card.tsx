"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { deleteEntryAction, editMessageAction, type ActionResult } from "./actions";
import {
  dangerButtonClass,
  errorTextClass,
  ghostButtonClass,
  inputClass,
  primaryButtonClass,
} from "./ui";

export type EntryView = {
  id: number;
  authorName: string;
  message: string;
  createdAtIso: string;
  createdAtLabel: string;
  updatedAtLabel: string | null;
};

type Mode = "view" | "edit" | "delete";

const WRONG_PASSWORD_EDIT = "비밀번호가 일치하지 않습니다. 수정이 거부되었어요.";
const WRONG_PASSWORD_DELETE = "비밀번호가 일치하지 않습니다. 삭제가 거부되었어요.";
const NOT_FOUND = "이미 삭제된 글입니다. 잠시 후 목록을 새로 고칩니다.";

export function EntryCard({ entry }: { entry: EntryView }) {
  const [mode, setMode] = useState<Mode>("view");

  return (
    <li className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="font-semibold text-zinc-900 dark:text-zinc-50">{entry.authorName}</span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          <time dateTime={entry.createdAtIso}>{entry.createdAtLabel}</time>
          {entry.updatedAtLabel && <> · (수정됨 {entry.updatedAtLabel})</>}
        </span>
      </div>

      {mode === "edit" ? (
        <EditForm entry={entry} onDone={() => setMode("view")} />
      ) : (
        <>
          <p className="mt-2 whitespace-pre-wrap break-words text-zinc-700 dark:text-zinc-300">
            {entry.message}
          </p>
          {mode === "delete" ? (
            <DeleteForm entry={entry} onCancel={() => setMode("view")} />
          ) : (
            <div className="mt-3 flex justify-end gap-1">
              <button type="button" onClick={() => setMode("edit")} className={ghostButtonClass}>
                수정
              </button>
              <button type="button" onClick={() => setMode("delete")} className={ghostButtonClass}>
                삭제
              </button>
            </div>
          )}
        </>
      )}
    </li>
  );
}

/** Refreshes the list shortly after an Entry turned out to be already deleted. */
function useRefreshWhenGone(state: ActionResult | null) {
  const router = useRouter();
  useEffect(() => {
    if (state?.status !== "not-found") return;
    const timer = setTimeout(() => router.refresh(), 2000);
    return () => clearTimeout(timer);
  }, [state, router]);
}

function EditForm({ entry, onDone }: { entry: EntryView; onDone: () => void }) {
  const [message, setMessage] = useState(entry.message);
  const [password, setPassword] = useState("");

  const [state, formAction, pending] = useActionState(
    async (_: ActionResult | null, formData: FormData) => {
      const result = await editMessageAction(formData);
      if (result.status === "ok") onDone();
      return result;
    },
    null,
  );
  useRefreshWhenGone(state);

  const errors = state?.status === "invalid" ? state.errors : {};

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-2">
      <input type="hidden" name="id" value={entry.id} />
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        메시지만 수정할 수 있어요. 이름은 바꿀 수 없어요.
      </p>
      <textarea
        name="message"
        aria-label="수정할 메시지"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        aria-invalid={!!errors.message}
        className={`${inputClass} resize-y`}
      />
      {errors.message && <span className={errorTextClass}>{errors.message}</span>}
      <PasswordField value={password} onChange={setPassword} error={errors.password} />
      <Refusal state={state} wrongPassword={WRONG_PASSWORD_EDIT} />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} disabled={pending} className={ghostButtonClass}>
          취소
        </button>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "저장 중…" : "저장"}
        </button>
      </div>
    </form>
  );
}

function DeleteForm({ entry, onCancel }: { entry: EntryView; onCancel: () => void }) {
  const [password, setPassword] = useState("");
  // On success the Entry leaves the list, unmounting this form, so no state to reset.
  const [state, formAction, pending] = useActionState(
    (_: ActionResult | null, formData: FormData) => deleteEntryAction(formData),
    null,
  );
  useRefreshWhenGone(state);

  return (
    <form
      action={formAction}
      className="mt-3 flex flex-col gap-2 rounded-xl bg-red-50 p-3 dark:bg-red-950/40"
    >
      <input type="hidden" name="id" value={entry.id} />
      <p className="text-sm text-red-700 dark:text-red-300">
        비밀번호를 입력하면 이 글이 완전히 삭제돼요.
      </p>
      <PasswordField value={password} onChange={setPassword} />
      <Refusal state={state} wrongPassword={WRONG_PASSWORD_DELETE} />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} disabled={pending} className={ghostButtonClass}>
          취소
        </button>
        <button type="submit" disabled={pending} className={dangerButtonClass}>
          {pending ? "삭제 중…" : "삭제"}
        </button>
      </div>
    </form>
  );
}

function PasswordField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <>
      <input
        name="password"
        type="password"
        aria-label="글 비밀번호"
        placeholder="글을 쓸 때 정한 비밀번호"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={inputClass}
      />
      {error && <span className={errorTextClass}>{error}</span>}
    </>
  );
}

function Refusal({ state, wrongPassword }: { state: ActionResult | null; wrongPassword: string }) {
  if (state?.status === "wrong-password") {
    return (
      <p role="alert" className={errorTextClass}>
        {wrongPassword}
      </p>
    );
  }
  if (state?.status === "not-found") {
    return (
      <p role="alert" className={errorTextClass}>
        {NOT_FOUND}
      </p>
    );
  }
  return null;
}
