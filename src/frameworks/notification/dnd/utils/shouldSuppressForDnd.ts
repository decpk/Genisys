import { useSettingsStore } from '@/store/settings-store'
import { isDndActive } from './isDndActive'
import { getCurrentTimeMinutes } from './getCurrentTimeMinutes'

/**
 * Returns `true` when DND is enabled in settings AND at least one of
 * the configured ranges is currently active.
 *
 * Reads directly from `useSettingsStore.getState()` so it can be called
 * outside of React (e.g. inside `notify()`). Pure read — no mutation.
 */
export function shouldSuppressForDnd(): boolean {
  const { dndEnabled, dndRanges } = useSettingsStore.getState()
  if (!dndEnabled) return false
  return isDndActive(dndRanges, getCurrentTimeMinutes())
}
