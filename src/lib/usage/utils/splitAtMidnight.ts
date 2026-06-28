/**
 * Splits a [startedAt, endedAt] span at each LOCAL midnight boundary so that
 * every returned piece falls entirely within a single calendar day. Returns a
 * single piece when the span does not cross midnight. If `endedAt <= startedAt`
 * the original span is returned unchanged (callers guard against zero/negative
 * durations).
 */
export function splitAtMidnight(
  startedAt: number,
  endedAt: number,
): Array<{ startedAt: number; endedAt: number }> {
  if (endedAt <= startedAt) {
    return [{ startedAt, endedAt }]
  }

  const pieces: Array<{ startedAt: number; endedAt: number }> = []
  let cursor = startedAt

  while (cursor < endedAt) {
    const date = new Date(cursor)
    const nextMidnight = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1,
      0,
      0,
      0,
      0,
    ).getTime()
    const pieceEnd = Math.min(nextMidnight, endedAt)
    pieces.push({ startedAt: cursor, endedAt: pieceEnd })
    cursor = pieceEnd
  }

  return pieces
}
