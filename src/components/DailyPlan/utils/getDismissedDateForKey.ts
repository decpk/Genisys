export function getDismissedDateForKey(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
