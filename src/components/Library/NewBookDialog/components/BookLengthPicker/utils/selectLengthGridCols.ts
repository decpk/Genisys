/**
 * Pick the Tailwind grid-cols class to fit the option count nicely.
 * - 3 options → 3 cols
 * - 4 options → 4 cols
 * - 5 options → 5 cols (single row, narrow)
 * - 6+ options → 4 cols (wraps to 2+ rows)
 */
export function selectLengthGridCols(count: number): string {
  if (count <= 3) return 'grid-cols-3'
  if (count === 4) return 'grid-cols-4'
  if (count === 5) return 'grid-cols-5'
  return 'grid-cols-4'
}
