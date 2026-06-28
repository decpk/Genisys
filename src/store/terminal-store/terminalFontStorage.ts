import { FONT_OPTIONS } from '@/lib/fonts'
import type { ReadingFont } from '@/store/settings-store'

const STORAGE_KEY = 'genisys.terminal.font'
const DEFAULT_FONT: ReadingFont = 'mono'

function isReadingFont(value: unknown): value is ReadingFont {
  return typeof value === 'string' && (FONT_OPTIONS as readonly string[]).includes(value)
}

/** Read the persisted terminal-only font preference, falling back to mono. */
export function loadTerminalFont(): ReadingFont {
  if (typeof window === 'undefined') return DEFAULT_FONT
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw && isReadingFont(raw)) return raw
  } catch {
    /* localStorage may be unavailable (private mode, sandbox) */
  }
  return DEFAULT_FONT
}

/** Persist the terminal-only font preference. */
export function saveTerminalFont(font: ReadingFont): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, font)
  } catch {
    /* ignore quota / disabled storage */
  }
}
