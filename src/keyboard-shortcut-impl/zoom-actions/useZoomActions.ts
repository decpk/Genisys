import { useBindShortcutActions } from '@/frameworks/keyboard-shortcut'

function safeZoomIn(): void {
  try {
    void window.api?.zoomIn?.()
  } catch {
    /* swallow */
  }
}

function safeZoomOut(): void {
  try {
    void window.api?.zoomOut?.()
  } catch {
    /* swallow */
  }
}

function safeZoomReset(): void {
  try {
    void window.api?.zoomReset?.()
  } catch {
    /* swallow */
  }
}

export function useZoomActions(): void {
  useBindShortcutActions({
    'global.zoomIn': safeZoomIn,
    'global.zoomOut': safeZoomOut,
    'global.zoomReset': safeZoomReset,
  })
}
