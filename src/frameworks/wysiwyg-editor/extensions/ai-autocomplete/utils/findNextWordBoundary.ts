/**
 * Given the remaining (unaccepted) portion of a suggestion,
 * return the length of the next "word" chunk to accept.
 *
 * A word chunk = contiguous non-whitespace chars + any trailing whitespace.
 * e.g. "fox jumps over" → first chunk is "fox " (4 chars).
 *
 * Returns 0 if the remaining string is empty.
 */
export function findNextWordBoundary(remaining: string): number {
  if (!remaining) return 0

  // Match: one or more non-whitespace chars, then optional trailing whitespace
  const match = remaining.match(/^\S+\s*/)
  if (!match) return remaining.length

  return match[0].length
}
