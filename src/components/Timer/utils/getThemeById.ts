import { TIMER_THEMES, type TimerTheme } from '../constants/timerThemes'

export function getThemeById(id: string): TimerTheme | undefined {
  return TIMER_THEMES.find((t) => t.id === id)
}
