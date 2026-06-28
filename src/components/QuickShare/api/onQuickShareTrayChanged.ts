import type { QuickShareTrayItem } from './types'

/** Subscribe to the shared tray changing. Returns an unsubscribe fn. */
export function onQuickShareTrayChanged(
  callback: (items: QuickShareTrayItem[]) => void,
): () => void {
  return window.api.onQuickShareTrayChanged((payload) => callback(payload.items))
}
