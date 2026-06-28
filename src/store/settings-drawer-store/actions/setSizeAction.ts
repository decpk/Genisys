import { patchAppData } from '@/store/app-data'

import { SETTINGS_WINDOW_SIZE } from '../settings-drawer-store.constants'
import type {
  SettingsDrawerState,
  WindowSize,
} from '../settings-drawer-store.types'

/**
 * Clamps `size` to the configured min/max bounds and persists to
 * `app-data.json`. Viewport-fraction clamping happens at render time.
 */
export function setSizeAction(
  get: () => SettingsDrawerState,
  set: (partial: Partial<SettingsDrawerState>) => void,
  size: WindowSize,
): void {
  const clamped: WindowSize = {
    width: clamp(
      size.width,
      SETTINGS_WINDOW_SIZE.MIN_WIDTH,
      SETTINGS_WINDOW_SIZE.MAX_WIDTH,
    ),
    height: clamp(
      size.height,
      SETTINGS_WINDOW_SIZE.MIN_HEIGHT,
      SETTINGS_WINDOW_SIZE.MAX_HEIGHT,
    ),
  }
  const current = get().size
  if (current.width === clamped.width && current.height === clamped.height) {
    return
  }
  set({ size: clamped })
  patchAppData((d) => {
    if (!d.settings.settingsDrawer) {
      d.settings.settingsDrawer = { size: clamped }
      return
    }
    d.settings.settingsDrawer.size = clamped
  })
}

function clamp(v: number, min: number, max: number): number {
  if (!Number.isFinite(v)) return min
  return Math.round(Math.min(Math.max(v, min), max))
}
