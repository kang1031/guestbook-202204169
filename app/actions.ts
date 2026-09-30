"use server";

import { revalidatePath } from "next/cache";
import { getGuestbook } from "@/lib/guestbook";
import type { FieldErrors } from "@/lib/guestbook/validation";

export type ActionResult =
  | { status: "ok" }
  | { status: "invalid"; errors: FieldErrors }
  | { status: "wrong-password" }
  | { status: "not-found" };

const text = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
};

export async function createEntryAction(formData: FormData): Promise<ActionResult> {
  const result = await getGuestbook().createEntry({
    authorName: text(formData, "authorName"),
    message: text(formData, "message"),
    password: text(formData, "password"),
  });
  if (result.status === "ok") {
    revalidatePath("/");
    return { status: "ok" };
  }
  return result;
}
