import { useSettingsStore } from '@/store/settings-store'

import type { CompletionChimeVariant } from './types'
import { playChimeSound } from './utils/playChimeSound'
import { isChimeDebounced } from './utils/isChimeDebounced'

/**
 * Plays the configured AI-completion chime for the given variant
 * (`'success'` for normal completion, `'error'` for failed/aborted streams).
 *
 * Behavior:
 *   - No-op when the master toggle (`playChimeOnCompletion`) is off.
 *   - No-op when the variant's configured sound id is `'none'` or unknown.
 *   - Debounced to at most one chime per ~1.5s across all call sites.
 *
 * Errors (autoplay block, audio context unavailable) are swallowed silently
 * — a failed chime must never affect the calling AI flow.
 */
export function playCompletionChime(variant: CompletionChimeVariant): void {
  const state = useSettingsStore.getState()
  if (!state.playChimeOnCompletion) return

  const soundId = variant === 'success' ? state.chimeSuccessSound : state.chimeErrorSound
  if (!soundId || soundId === 'none') return

  if (isChimeDebounced()) return
  playChimeSound(soundId)
}
