import type { CompletionChimeSound } from './types'

/**
 * Sound catalog for the AI completion chime.
 *
 * Each entry maps to a Web Audio synth profile in
 * `TIMER_TONE_PROFILES` (see `src/components/Timer/constants/timerToneProfiles.ts`),
 * so no binary audio assets are required. The `none` entry disables the
 * chime for that variant without disabling the global toggle.
 */
export const COMPLETION_CHIME_SOUNDS: ReadonlyArray<CompletionChimeSound> = [
  { id: 'none', label: 'No sound' },
  { id: 'chime', label: 'Chime' },
  { id: 'bell', label: 'Bell' },
  { id: 'gentle-bell', label: 'Gentle bell' },
  { id: 'soft-pop', label: 'Soft pop' },
  { id: 'digital', label: 'Digital' },
  { id: 'nature', label: 'Nature' },
  { id: 'tick', label: 'Tick' },
]

export const DEFAULT_COMPLETION_SUCCESS_SOUND = 'chime'
export const DEFAULT_COMPLETION_ERROR_SOUND = 'soft-pop'
