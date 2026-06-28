/**
 * Builds the label rendered inside the `SectionCountChip` for a TaskSection.
 *
 *  - Active variant:    "{done}/{total}" (e.g. "2/8")
 *  - Completed variant: "{count}"        (e.g. "5")
 */
export function formatTaskCountLabel(args: {
  variant: 'active' | 'completed'
  totalCount: number
  completedCount: number
}): string {
  const { variant, totalCount, completedCount } = args
  if (variant === 'completed') return String(totalCount)
  return `${completedCount}/${totalCount}`
}
