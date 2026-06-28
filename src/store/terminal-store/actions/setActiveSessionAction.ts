import type { StoreApi } from 'zustand'

import type { TerminalStore } from '../types'

export function setActiveSessionAction(
  set: StoreApi<TerminalStore>['setState'],
  _get: StoreApi<TerminalStore>['getState'],
  id: string
): void {
  set({ activeId: id })
}
