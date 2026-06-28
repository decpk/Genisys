import { synthesizeTimerSound } from '@/components/Timer/utils/synthesizeTimerSound'
import { TIMER_TONE_PROFILES } from '@/components/Timer/constants/timerToneProfiles'

/**
 * Plays the chime sound for the given id using Web Audio synthesis.
 *
 * We reuse `synthesizeTimerSound` + `TIMER_TONE_PROFILES` from the Timer
 * feature so the chime works without any binary audio assets, plays
 * reliably offline, and stays in sync with whatever tone the user already
 * recognizes from the Timer.
 *
 * Returns true when a sound was played, false when the id is unknown or
 * resolves to no sound.
 */
export function playChimeSound(soundId: string): boolean {
  if (!soundId || soundId === 'none') return false
  if (!TIMER_TONE_PROFILES[soundId]) return false
  synthesizeTimerSound(soundId)
  return true
}
