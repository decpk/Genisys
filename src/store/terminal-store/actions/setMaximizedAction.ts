import type { StoreApi } from 'zustand'

import type { TerminalStore } from '../types'

export function setMaximizedAction(
  set: StoreApi<TerminalStore>['setState'],
  _get: StoreApi<TerminalStore>['getState'],
  maximized: boolean
): void {
  set({ maximized })
}
