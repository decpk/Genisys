import { useSettingsStore } from '@/store/settings-store'

import type { CompletionChimeSettingsData } from './CompletionChimeSettings.types'

/**
 * Selects the chime-related fields and setters from the settings store as
 * individual primitives — never returns a fresh object literal from a
 * selector, to avoid the zustand `getSnapshot` re-render trap.
 */
export function useCompletionChimeSettingsData(): CompletionChimeSettingsData {
  const playChimeOnCompletion = useSettingsStore((s) => s.playChimeOnCompletion)
  const chimeSuccessSound = useSettingsStore((s) => s.chimeSuccessSound)
  const chimeErrorSound = useSettingsStore((s) => s.chimeErrorSound)
  const setPlayChimeOnCompletion = useSettingsStore((s) => s.setPlayChimeOnCompletion)
  const setChimeSuccessSound = useSettingsStore((s) => s.setChimeSuccessSound)
  const setChimeErrorSound = useSettingsStore((s) => s.setChimeErrorSound)

  return {
    playChimeOnCompletion,
    chimeSuccessSound,
    chimeErrorSound,
    setPlayChimeOnCompletion,
    setChimeSuccessSound,
    setChimeErrorSound,
  }
}
