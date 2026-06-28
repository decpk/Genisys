/**
 * Tone profile descriptors used by `synthesizeTimerSound`. Each profile is
 * a small sequence of notes the Web Audio API plays in series. Keeping the
 * config declarative lets us add new profiles without touching the audio
 * engine.
 */
export interface TimerToneNote {
  freq: number
  durationMs: number
  /** Delay (ms) AFTER this note before the next one starts. Default 0. */
  gapMs?: number
  type?: OscillatorType
  /** Peak gain (0..1). Default 0.25. */
  gain?: number
}

export interface TimerToneProfile {
  /** Optional master gain multiplier for the whole sequence. */
  masterGain?: number
  notes: TimerToneNote[]
}

export const TIMER_TONE_PROFILES: Record<string, TimerToneProfile> = {
  bell: {
    notes: [
      { freq: 880, durationMs: 600, type: 'sine', gain: 0.3 },
      { freq: 1320, durationMs: 600, type: 'sine', gain: 0.18 },
    ],
  },
  chime: {
    notes: [
      { freq: 1046, durationMs: 220, type: 'sine', gain: 0.25, gapMs: 40 },
      { freq: 1318, durationMs: 220, type: 'sine', gain: 0.25, gapMs: 40 },
      { freq: 1568, durationMs: 360, type: 'sine', gain: 0.25 },
    ],
  },
  digital: {
    notes: [
      { freq: 1000, durationMs: 90, type: 'square', gain: 0.18, gapMs: 70 },
      { freq: 1000, durationMs: 90, type: 'square', gain: 0.18, gapMs: 70 },
      { freq: 1500, durationMs: 160, type: 'square', gain: 0.18 },
    ],
  },
  nature: {
    notes: [
      { freq: 660, durationMs: 280, type: 'sine', gain: 0.22, gapMs: 60 },
      { freq: 880, durationMs: 360, type: 'sine', gain: 0.22 },
    ],
  },
  'soft-pop': {
    notes: [{ freq: 520, durationMs: 140, type: 'triangle', gain: 0.3 }],
  },
  'gentle-bell': {
    notes: [
      { freq: 740, durationMs: 700, type: 'sine', gain: 0.22 },
      { freq: 1110, durationMs: 700, type: 'sine', gain: 0.14 },
    ],
  },
  tick: {
    notes: [{ freq: 1800, durationMs: 35, type: 'square', gain: 0.18 }],
  },
}
