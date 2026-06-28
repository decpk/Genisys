export interface ThemeScheduleRange {
  id: string
  startTime: string  // "HH:mm" format, 24h
  endTime: string    // "HH:mm" format, 24h
  themeId: string
}

export interface AutoThemeConfig {
  enabled: boolean
  pauseOnManualChange: boolean
  ranges: ThemeScheduleRange[]
}

export const MAX_SCHEDULE_RANGES = 5

export const AUTO_THEME_DEFAULTS: AutoThemeConfig = {
  enabled: false,
  pauseOnManualChange: true,
  ranges: [],
}
