import {
  SETTINGS_WINDOW_SIZE,
  type WindowSize,
} from '@/store/settings-drawer-store'

/**
 * Returns a `WindowSize` clamped to both the configured min/max and the
 * viewport's `MAX_VIEWPORT_FRACTION`. Runtime-only — the persisted size
 * may exceed viewport bounds when the user later resizes their browser.
 */
export function clampSize(
  size: WindowSize,
  viewport: { width: number; height: number },
): WindowSize {
  const maxW = Math.min(
    SETTINGS_WINDOW_SIZE.MAX_WIDTH,
    Math.floor(viewport.width * SETTINGS_WINDOW_SIZE.MAX_VIEWPORT_FRACTION),
  )
  const maxH = Math.min(
    SETTINGS_WINDOW_SIZE.MAX_HEIGHT,
    Math.floor(viewport.height * SETTINGS_WINDOW_SIZE.MAX_VIEWPORT_FRACTION),
  )
  return {
    width: Math.max(
      SETTINGS_WINDOW_SIZE.MIN_WIDTH,
      Math.min(size.width, maxW),
    ),
    height: Math.max(
      SETTINGS_WINDOW_SIZE.MIN_HEIGHT,
      Math.min(size.height, maxH),
    ),
  }
}
