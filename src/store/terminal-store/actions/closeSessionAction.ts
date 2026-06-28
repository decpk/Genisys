import type { StoreApi } from 'zustand'

import { terminalKill } from '@/components/Terminal/api/terminalKill'

import type { TerminalStore } from '../types'

export async function closeSessionAction(
  set: StoreApi<TerminalStore>['setState'],
  get: StoreApi<TerminalStore>['getState'],
  id: string
): Promise<void> {
  try {
    await terminalKill(id)
  } catch (err) {
    console.warn('[terminal-store] kill failed (already exited?)', err)
  }
  const remaining = get().sessions.filter((s) => s.id !== id)
  const wasActive = get().activeId === id
  const noneLeft = remaining.length === 0
  set({
    sessions: remaining,
    activeId: wasActive ? (remaining[remaining.length - 1]?.id ?? null) : get().activeId,
    // Closing the last tab collapses the dock entirely (also exits maximized)
    open: noneLeft ? false : get().open,
    maximized: noneLeft ? false : get().maximized,
  })
}
