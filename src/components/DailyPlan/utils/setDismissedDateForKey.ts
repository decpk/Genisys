export function setDismissedDateForKey(key: string, date: string): void {
  try {
    localStorage.setItem(key, date)
  } catch {
    // Ignore storage failures (private mode / quota).
  }
}
