import type { StoreApi } from 'zustand'

import type { TerminalStore } from '../types'

export function handleSessionExitAction(
  set: StoreApi<TerminalStore>['setState'],
  _get: StoreApi<TerminalStore>['getState'],
  id: string,
  code: number | null
): void {
  set((state) => ({
    sessions: state.sessions.map((s) =>
      s.id === id ? { ...s, exited: true, exitCode: code } : s
    ),
  }))
}
