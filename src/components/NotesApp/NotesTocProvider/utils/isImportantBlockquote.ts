import type { NotesTocPositionedItem } from '../NotesTocProvider.types'

const MIN_LEN = 20
const QUIZ_PATTERN = /^\*\*(Answer|Explanation):\*\*/

/**
 * A blockquote becomes a TOC highlight when it is:
 *  - long enough to be worth jumping to (> 20 chars),
 *  - not a quiz answer/explanation (those are paired with the question above), and
 *  - not adjacent to another highlight (avoids back-to-back duplicates).
 */
export function isImportantBlockquote(
  text: string,
  prevItem: NotesTocPositionedItem | null,
): boolean {
  if (text.length <= MIN_LEN) return false
  if (QUIZ_PATTERN.test(text)) return false
  if (prevItem?.type === 'important') return false
  return true
}
