const STRICT_EQ = /[!=]==/

/** True when text contains a strict equality operator (`===` or `!==`). */
export function hasStrictEquality(text: string): boolean {
  return STRICT_EQ.test(text)
}
