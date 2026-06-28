/** Truncate text for single-line table display; collapses whitespace and adds an ellipsis when cut. */
export function truncateText(text: string, maxLength = 80): string {
  const singleLine = text.replace(/\s+/g, ' ').trim()
  if (singleLine.length <= maxLength) return singleLine
  return singleLine.slice(0, maxLength - 1).trimEnd() + '…'
}
