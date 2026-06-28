import { create } from 'zustand'

import { closeSessionAction } from './terminal-store/actions/closeSessionAction'
import { createSessionAction } from './terminal-store/actions/createSessionAction'
import { handleSessionExitAction } from './terminal-store/actions/handleSessionExitAction'
import { setActiveSessionAction } from './terminal-store/actions/setActiveSessionAction'
import { setHeightAction } from './terminal-store/actions/setHeightAction'
import { setMaximizedAction } from './terminal-store/actions/setMaximizedAction'
import { setOpenAction } from './terminal-store/actions/setOpenAction'
import { setTerminalFontAction } from './terminal-store/actions/setTerminalFontAction'
import { setTerminalFontSizeAction } from './terminal-store/actions/setTerminalFontSizeAction'
import { toggleOpenAction } from './terminal-store/actions/toggleOpenAction'
import { loadTerminalFont } from './terminal-store/terminalFontStorage'
import { loadTerminalFontSize } from './terminal-store/terminalFontSizeStorage'
import type { TerminalStore } from './terminal-store/types'

export const useTerminalStore = create<TerminalStore>((set, get) => ({
  // ── state ────────────────────────────────────────────────────────────────
  sessions: [],
  activeId: null,
  open: false,
  height: 280,
  maximized: false,
  terminalFont: loadTerminalFont(),
  terminalFontSize: loadTerminalFontSize(),

  // ── actions (delegated) ──────────────────────────────────────────────────
  createSession: (input) => createSessionAction(set, get, input),
  closeSession: (id) => closeSessionAction(set, get, id),
  setActiveSession: (id) => setActiveSessionAction(set, get, id),
  handleSessionExit: (id, code) => handleSessionExitAction(set, get, id, code),
  setOpen: (open) => setOpenAction(set, get, open),
  toggleOpen: () => toggleOpenAction(set, get),
  setHeight: (h) => setHeightAction(set, get, h),
  setMaximized: (m) => setMaximizedAction(set, get, m),
  setTerminalFont: (font) => setTerminalFontAction(set, get, font),
  setTerminalFontSize: (size) => setTerminalFontSizeAction(set, get, size),
}))
