import type { StoreApi } from 'zustand'

import {
  MAX_TERMINAL_FONT_SIZE,
  MIN_TERMINAL_FONT_SIZE,
  saveTerminalFontSize,
} from '../terminalFontSizeStorage'
import type { TerminalStore } from '../types'

export function setTerminalFontSizeAction(
  set: StoreApi<TerminalStore>['setState'],
  get: StoreApi<TerminalStore>['getState'],
  size: number
): void {
  if (!Number.isFinite(size)) return
  const clamped = Math.max(MIN_TERMINAL_FONT_SIZE, Math.min(MAX_TERMINAL_FONT_SIZE, Math.round(size)))
  if (get().terminalFontSize === clamped) return
  set({ terminalFontSize: clamped })
  saveTerminalFontSize(clamped)
}
