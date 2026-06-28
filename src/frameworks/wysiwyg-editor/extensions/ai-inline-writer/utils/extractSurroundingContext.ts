export function extractSurroundingContext(
  doc: { textBetween: (from: number, to: number) => string; content: { size: number } },
  cursorPos: number,
  maxChars: number,
): { before: string; after: string } {
  const halfMax = Math.floor(maxChars / 2)
  const beforeStart = Math.max(0, cursorPos - halfMax)
  const afterEnd = Math.min(doc.content.size, cursorPos + halfMax)

  const before = doc.textBetween(beforeStart, cursorPos)
  const after = doc.textBetween(cursorPos, afterEnd)

  return { before, after }
}
