import { CARRYOVER_DISMISSED_KEY } from '../CarryOverBanner.constants'

export function getCarryOverDismissedDate(): string | null {
  try {
    return localStorage.getItem(CARRYOVER_DISMISSED_KEY)
  } catch {
    return null
  }
}
