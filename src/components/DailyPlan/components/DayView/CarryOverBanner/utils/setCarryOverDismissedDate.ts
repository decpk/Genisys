import { CARRYOVER_DISMISSED_KEY } from '../CarryOverBanner.constants'

export function setCarryOverDismissedDate(date: string): void {
  try {
    localStorage.setItem(CARRYOVER_DISMISSED_KEY, date)
  } catch {
    // Ignore storage failures (private mode / quota).
  }
}
