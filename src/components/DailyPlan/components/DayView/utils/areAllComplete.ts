/**
 * Returns true when nothing is pending in the section — i.e. there are no
 * incomplete items. An empty section counts as "all done" (nothing left to do).
 * Used to decide whether a DayView section header shows the "all done" check.
 */
export function areAllComplete<T>(items: T[], isCompleted: (item: T) => boolean): boolean {
  return items.every(isCompleted)
}
