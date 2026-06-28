import type {
  SettingsDrawerState,
  WindowSize,
} from './settings-drawer-store.types'

export const SETTINGS_WINDOW_SIZE = {
  MIN_WIDTH: 560,
  MIN_HEIGHT: 400,
  DEFAULT_WIDTH: 900,
  DEFAULT_HEIGHT: 640,
  /** Hard ceiling. Window also clamps to viewport at render time. */
  MAX_WIDTH: 1800,
  MAX_HEIGHT: 1200,
  /** Window never grows past this fraction of the viewport. */
  MAX_VIEWPORT_FRACTION: 0.95,
} as const

export const SETTINGS_WINDOW_DEFAULT_SIZE: WindowSize = {
  width: SETTINGS_WINDOW_SIZE.DEFAULT_WIDTH,
  height: SETTINGS_WINDOW_SIZE.DEFAULT_HEIGHT,
}

export const SETTINGS_DRAWER_DEFAULTS: SettingsDrawerState = {
  isOpen: false,
  position: null,
  size: SETTINGS_WINDOW_DEFAULT_SIZE,
  isLoaded: false,
  activeSection: 'user',
}
