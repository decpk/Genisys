import type { StoreApi } from 'zustand'

import type { TerminalStore } from '../types'

const MIN_HEIGHT = 120
const MAX_HEIGHT = 1200

export function setHeightAction(
  set: StoreApi<TerminalStore>['setState'],
  _get: StoreApi<TerminalStore>['getState'],
  height: number
): void {
  const clamped = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, Math.round(height)))
  set({ height: clamped })
}
