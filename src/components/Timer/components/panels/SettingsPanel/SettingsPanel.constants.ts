export const SETTINGS_SECTION_IDS = {
  durations: 'durations',
  sound: 'sound',
  theme: 'theme',
  behavior: 'behavior',
} as const

export const SETTINGS_DEFAULT_OPEN_SECTIONS: ReadonlyArray<string> = [
  SETTINGS_SECTION_IDS.durations,
  SETTINGS_SECTION_IDS.theme,
]
