export interface TerminalSessionMeta {
  id: string
  title: string
  shell: string
  cwd: string | null
  createdAt: number
  exited: boolean
  exitCode: number | null
}

import type { ReadingFont } from '@/store/settings-store'

export interface TerminalStoreState {
  sessions: TerminalSessionMeta[]
  activeId: string | null
  open: boolean
  height: number
  maximized: boolean
  terminalFont: ReadingFont
  terminalFontSize: number
}

export interface CreateSessionInput {
  cwd?: string
  shell?: string
  args?: string[]
  cols?: number
  rows?: number
}

export interface TerminalStoreActions {
  createSession: (input?: CreateSessionInput) => Promise<string | null>
  closeSession: (id: string) => Promise<void>
  setActiveSession: (id: string) => void
  handleSessionExit: (id: string, code: number | null) => void
  setOpen: (open: boolean) => void
  toggleOpen: () => void
  setHeight: (height: number) => void
  setMaximized: (maximized: boolean) => void
  setTerminalFont: (font: ReadingFont) => void
  setTerminalFontSize: (size: number) => void
}

export type TerminalStore = TerminalStoreState & TerminalStoreActions
