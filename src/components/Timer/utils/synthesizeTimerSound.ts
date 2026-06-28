import { TIMER_TONE_PROFILES } from '../constants/timerToneProfiles'
import type { TimerToneProfile } from '../constants/timerToneProfiles'

/** Lazy singleton AudioContext — created on first user gesture. */
let ctx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (ctx) return ctx
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  try {
    ctx = new Ctor()
    return ctx
  } catch {
    return null
  }
}

/**
 * Synthesize a Timer profile using Web Audio. Each note is a short
 * envelope-shaped oscillator burst played in series. No binary assets
 * required, and playback works offline.
 */
export function synthesizeTimerSound(profileId: string): void {
  const profile: TimerToneProfile | undefined = TIMER_TONE_PROFILES[profileId]
  if (!profile) return

  const audio = getAudioContext()
  if (!audio) return

  // Some browsers start the context suspended until a user gesture.
  if (audio.state === 'suspended') {
    audio.resume().catch(() => {
      /* noop */
    })
  }

  const masterGain = profile.masterGain ?? 1
  let cursorSec = audio.currentTime + 0.01

  for (const note of profile.notes) {
    const osc = audio.createOscillator()
    const gain = audio.createGain()

    osc.type = note.type ?? 'sine'
    osc.frequency.value = note.freq

    const peak = (note.gain ?? 0.25) * masterGain
    const durationSec = note.durationMs / 1000
    const attackSec = Math.min(0.015, durationSec * 0.2)
    const releaseSec = Math.max(0.04, durationSec * 0.6)

    gain.gain.setValueAtTime(0.0001, cursorSec)
    gain.gain.exponentialRampToValueAtTime(peak, cursorSec + attackSec)
    gain.gain.exponentialRampToValueAtTime(0.0001, cursorSec + durationSec + releaseSec)

    osc.connect(gain).connect(audio.destination)
    osc.start(cursorSec)
    osc.stop(cursorSec + durationSec + releaseSec + 0.02)

    cursorSec += durationSec + (note.gapMs ?? 0) / 1000
  }
}
