import { playChimeSound } from './utils/playChimeSound'

/**
 * Plays the given chime sound immediately, bypassing the global toggle and
 * the debounce. Used by the Settings UI "Test" buttons so users can preview
 * sounds even when the master toggle is off.
 */
export function previewCompletionChime(soundId: string): void {
  playChimeSound(soundId)
}
