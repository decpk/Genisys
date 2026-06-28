export function isDismissedForToday(dismissedDate: string | null, today: string): boolean {
  return dismissedDate === today
}
