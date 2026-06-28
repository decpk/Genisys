import { TIMER_SOUNDS } from '../constants/timerSounds'
import { TIMER_TONE_PROFILES } from '../constants/timerToneProfiles'
import { synthesizeTimerSound } from './synthesizeTimerSound'

const audioCache = new Map<string, HTMLAudioElement>()

export type TimerSoundEvent = 'work-end' | 'break-end' | 'tick'

function getOrCreateAudio(file: string): HTMLAudioElement | null {
  if (typeof Audio === 'undefined') return null
  const cached = audioCache.get(file)
  if (cached) return cached
  try {
    const audio = new Audio(file)
    audio.preload = 'auto'
    audioCache.set(file, audio)
    return audio
  } catch {
    return null
  }
}

/**
 * Plays a timer sound for the given profileId.
 * Strategy:
 *   1. If a known synth profile exists for the id, use Web Audio (always
 *      works, no binary asset needed).
 *   2. Otherwise fall back to the configured mp3 file via HTMLAudioElement.
 * Errors (autoplay block, missing file, etc.) are swallowed silently.
 */
export function playTimerSound(profileId: string, _event: TimerSoundEvent): void {
  if (profileId === 'none') return

  if (TIMER_TONE_PROFILES[profileId]) {
    synthesizeTimerSound(profileId)
    return
  }

  const profile = TIMER_SOUNDS.find((s) => s.id === profileId)
  if (!profile || !profile.file) return

  const audio = getOrCreateAudio(profile.file)
  if (!audio) return

  try {
    audio.currentTime = 0
    const playResult = audio.play()
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(() => {
        /* noop — autoplay blocked or load failed */
      })
    }
  } catch {
    /* noop */
  }
}
