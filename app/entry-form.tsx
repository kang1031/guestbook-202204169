"use client";

import { useActionState, useState } from "react";
import { createEntryAction, type ActionResult } from "./actions";
import { errorTextClass, inputClass, primaryButtonClass } from "./ui";

export function EntryForm() {
  // Controlled fields, so a rejected submission keeps what the visitor typed.
  const [authorName, setAuthorName] = useState("");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");

  const [state, formAction, pending] = useActionState(
    async (_: ActionResult | null, formData: FormData) => {
      const result = await createEntryAction(formData);
      if (result.status === "ok") {
        // Keep the name for the next Entry; clear what shouldn't be sent twice.
        setMessage("");
        setPassword("");
      }
      return result;
    },
    null,
  );
  const errors = state?.status === "invalid" ? state.errors : {};

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">글 남기기</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          이름
          <input
            name="authorName"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="최대 20자"
            autoComplete="nickname"
            aria-invalid={!!errors.authorName}
            className={inputClass}
          />
          {errors.authorName && <span className={errorTextClass}>{errors.authorName}</span>}
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          비밀번호
          <input
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="수정·삭제할 때 필요해요 (4자 이상)"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            className={inputClass}
          />
          {errors.password && <span className={errorTextClass}>{errors.password}</span>}
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        메시지
        <textarea
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="한마디 남겨 주세요 (최대 500자)"
          aria-invalid={!!errors.message}
          className={`${inputClass} resize-y`}
        />
        {errors.message && <span className={errorTextClass}>{errors.message}</span>}
      </label>

      <div className="flex justify-end">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "남기는 중…" : "남기기"}
        </button>
      </div>
    </form>
  );
}
