/**
 * A configurable sound option for the AI completion chime.
 *
 * `id` matches a key in `TIMER_TONE_PROFILES` (Web Audio synth profile).
 * The id `'none'` represents "no sound" for the variant.
 */
export interface CompletionChimeSound {
  id: string
  label: string
}

export type CompletionChimeVariant = 'success' | 'error'
