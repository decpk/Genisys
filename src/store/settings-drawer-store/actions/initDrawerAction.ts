import { loadAppData } from '@/store/app-data'

import {
  SETTINGS_DRAWER_DEFAULTS,
  SETTINGS_WINDOW_DEFAULT_SIZE,
  SETTINGS_WINDOW_SIZE,
} from '../settings-drawer-store.constants'
import type {
  SettingsDrawerState,
  WindowPosition,
  WindowSize,
} from '../settings-drawer-store.types'

/**
 * Hydrate window state from `app-data.json`. Reads `position` + `size`,
 * leaving `isOpen` at its default (`false`). Performs one-time migration
 * for the legacy `width`-only schema from the side-panel era.
 */
export async function initDrawerAction(
  set: (partial: Partial<SettingsDrawerState>) => void,
): Promise<void> {
  const data = await loadAppData()
  const persisted = data.settings.settingsDrawer

  let size: WindowSize = SETTINGS_DRAWER_DEFAULTS.size
  if (persisted?.size) {
    size = clampSize(persisted.size)
  } else if (persisted?.width != null) {
    // Legacy side-panel data: only `width` was stored. Migrate to full size.
    size = clampSize({
      width: persisted.width,
      height: SETTINGS_WINDOW_DEFAULT_SIZE.height,
    })
  }

  const position: WindowPosition | null = persisted?.position ?? null

  set({
    isLoaded: true,
    position,
    size,
  })
}

function clampSize(s: WindowSize): WindowSize {
  return {
    width: clamp(
      s.width,
      SETTINGS_WINDOW_SIZE.MIN_WIDTH,
      SETTINGS_WINDOW_SIZE.MAX_WIDTH,
    ),
    height: clamp(
      s.height,
      SETTINGS_WINDOW_SIZE.MIN_HEIGHT,
      SETTINGS_WINDOW_SIZE.MAX_HEIGHT,
    ),
  }
}

function clamp(v: number, min: number, max: number): number {
  if (!Number.isFinite(v)) return min
  return Math.round(Math.min(Math.max(v, min), max))
}
