import { TIMER_SOUNDS, type TimerSound } from '../constants/timerSounds'

export function getSoundById(id: string): TimerSound | undefined {
  return TIMER_SOUNDS.find((s) => s.id === id)
}
