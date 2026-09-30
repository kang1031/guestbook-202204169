export const LIMITS = {
  authorName: { min: 1, max: 20 },
  message: { min: 1, max: 500 },
  password: { min: 4, max: 72 },
} as const;

export type Field = keyof typeof LIMITS;
export type FieldErrors = Partial<Record<Field, string>>;

const segmenter = new Intl.Segmenter("ko", { granularity: "grapheme" });

/** Length in user-visible characters, so an emoji or a Hangul syllable counts as one. */
function visibleLength(text: string): number {
  return Array.from(segmenter.segment(text)).length;
}

// Korean particles differ per word, so each label carries its own object/topic particle.
const LABELS: Record<Field, { object: string; topic: string }> = {
  authorName: { object: "이름을", topic: "이름은" },
  message: { object: "메시지를", topic: "메시지는" },
  password: { object: "비밀번호를", topic: "비밀번호는" },
};

function check(field: Field, value: string): string | undefined {
  const { min, max } = LIMITS[field];
  const label = LABELS[field];
  const length = visibleLength(value);
  if (length === 0) return `${label.object} 입력해 주세요.`;
  if (length < min) return `${label.topic} ${min}자 이상이어야 해요.`;
  if (length > max) return `${label.topic} ${max}자까지 쓸 수 있어요.`;
  return undefined;
}

/**
 * Normalizes and checks the given fields. The author name and message are trimmed;
 * the password is kept exactly as typed.
 */
export function validate<F extends Field>(
  input: Record<F, string>,
): { ok: true; value: Record<F, string> } | { ok: false; errors: FieldErrors } {
  const value = {} as Record<F, string>;
  const errors: FieldErrors = {};

  for (const field of Object.keys(input) as F[]) {
    const normalized = field === "password" ? input[field] : input[field].trim();
    const error = check(field, normalized);
    if (error) errors[field] = error;
    value[field] = normalized;
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, value };
}
