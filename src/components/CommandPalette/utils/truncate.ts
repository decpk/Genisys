/** Truncate text to maxLen with an ellipsis. Returns '' for null/undefined. */
export function truncate(text: string | null | undefined, maxLen: number): string {
  if (!text) return ''
  const trimmed = text.trim().replace(/\s+/g, ' ')
  if (trimmed.length <= maxLen) return trimmed
  return trimmed.slice(0, maxLen - 1).trimEnd() + '…'
}
