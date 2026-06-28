export interface TimerSound {
  id: string
  label: string
  file: string
}

export const TIMER_SOUNDS: TimerSound[] = [
  { id: 'none', label: 'No Sound', file: '' },
  { id: 'bell', label: 'Bell', file: '/sounds/timer/bell.mp3' },
  { id: 'chime', label: 'Chime', file: '/sounds/timer/chime.mp3' },
  { id: 'digital', label: 'Digital', file: '/sounds/timer/digital.mp3' },
  { id: 'nature', label: 'Nature', file: '/sounds/timer/nature.mp3' },
  { id: 'soft-pop', label: 'Soft Pop', file: '/sounds/timer/soft-pop.mp3' },
  { id: 'gentle-bell', label: 'Gentle Bell', file: '/sounds/timer/gentle-bell.mp3' },
  { id: 'tick', label: 'Tick', file: '/sounds/timer/tick.mp3' },
]
