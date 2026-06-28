import { TIMER_TONE_PROFILES } from '@/components/Timer/constants/timerToneProfiles'

const FALLBACK_DURATION_MS = 1000
const TRAILING_BUFFER_MS = 120

/**
 * Compute the total time (ms) the equalizer indicator should remain active for
 * a given sound profile. Sums each note's duration plus any inter-note gap and
 * adds a small trailing buffer so the indicator does not blink off mid-tone.
 *
 * Falls back to FALLBACK_DURATION_MS when the profile is unknown (e.g. file-only
 * sound entries that have no synth recipe).
 */
export function getSoundProfileDurationMs(soundId: string): number {
  const profile = TIMER_TONE_PROFILES[soundId]
  if (!profile) return FALLBACK_DURATION_MS

  let total = 0
  for (const note of profile.notes) {
    total += Math.max(0, note.durationMs)
    total += Math.max(0, note.gapMs ?? 0)
  }
  if (total <= 0) return FALLBACK_DURATION_MS
  return total + TRAILING_BUFFER_MS
}
