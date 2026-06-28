import { patchAppData } from '@/store/app-data'

import { SETTINGS_WINDOW_SIZE } from '../settings-drawer-store.constants'
import type {
  SettingsDrawerState,
  WindowPosition,
} from '../settings-drawer-store.types'

/**
 * Persist the window position. Values are stored verbatim — clamping to
 * viewport happens at render time (so a saved off-screen position can be
 * recovered when the user resizes their window). We still clamp to a
 * sane non-negative ceiling here to guard against runaway values.
 */
export function setPositionAction(
  get: () => SettingsDrawerState,
  set: (partial: Partial<SettingsDrawerState>) => void,
  position: WindowPosition,
): void {
  const clamped: WindowPosition = {
    x: clampAxis(position.x),
    y: clampAxis(position.y),
  }
  const current = get().position
  if (current && current.x === clamped.x && current.y === clamped.y) return
  set({ position: clamped })
  patchAppData((d) => {
    if (!d.settings.settingsDrawer) {
      d.settings.settingsDrawer = { position: clamped }
      return
    }
    d.settings.settingsDrawer.position = clamped
  })
}

function clampAxis(v: number): number {
  if (!Number.isFinite(v)) return 0
  // Allow a generous range — viewport clamping is the runtime safety net.
  const MAX = SETTINGS_WINDOW_SIZE.MAX_WIDTH + SETTINGS_WINDOW_SIZE.MAX_HEIGHT
  return Math.round(Math.min(Math.max(v, -MAX), MAX))
}
