import type { StoreApi } from 'zustand'

import type { ReadingFont } from '@/store/settings-store'

import { saveTerminalFont } from '../terminalFontStorage'
import type { TerminalStore } from '../types'

export function setTerminalFontAction(
  set: StoreApi<TerminalStore>['setState'],
  get: StoreApi<TerminalStore>['getState'],
  font: ReadingFont
): void {
  if (get().terminalFont === font) return
  set({ terminalFont: font })
  saveTerminalFont(font)
}
