import type { StoreApi } from 'zustand'

import { terminalCreate } from '@/components/Terminal/api/terminalCreate'
import { formatSessionTitle } from '@/components/Terminal/utils/formatSessionTitle'

import type { CreateSessionInput, TerminalSessionMeta, TerminalStore } from '../types'

export async function createSessionAction(
  set: StoreApi<TerminalStore>['setState'],
  get: StoreApi<TerminalStore>['getState'],
  input?: CreateSessionInput
): Promise<string | null> {
  const cwd = input?.cwd ?? undefined

  try {
    const created = await terminalCreate({
      cwd,
      shell: input?.shell,
      args: input?.args,
      cols: input?.cols ?? 80,
      rows: input?.rows ?? 24,
    })
    const meta: TerminalSessionMeta = {
      id: created.id,
      title: formatSessionTitle(get().sessions.length, created.shell, created.cwd),
      shell: created.shell,
      cwd: created.cwd,
      createdAt: Date.now(),
      exited: false,
      exitCode: null,
    }
    set((state) => ({
      sessions: [...state.sessions, meta],
      activeId: meta.id,
      open: true,
    }))
    return meta.id
  } catch (err) {
    console.error('[terminal-store] createSession failed', err)
    return null
  }
}
