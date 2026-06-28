const STORAGE_KEY = 'genisys.terminal.fontSize'
const DEFAULT_SIZE = 13
const MIN_SIZE = 8
const MAX_SIZE = 32

function isValidSize(value: number): boolean {
  return Number.isFinite(value) && value >= MIN_SIZE && value <= MAX_SIZE
}

/** Read the persisted terminal font size, falling back to 13. */
export function loadTerminalFontSize(): number {
  if (typeof window === 'undefined') return DEFAULT_SIZE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SIZE
    const parsed = Number.parseInt(raw, 10)
    if (isValidSize(parsed)) return parsed
  } catch {
    /* ignore */
  }
  return DEFAULT_SIZE
}

/** Persist the terminal font size. */
export function saveTerminalFontSize(size: number): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, String(size))
  } catch {
    /* ignore quota / disabled storage */
  }
}

export { DEFAULT_SIZE as DEFAULT_TERMINAL_FONT_SIZE, MIN_SIZE as MIN_TERMINAL_FONT_SIZE, MAX_SIZE as MAX_TERMINAL_FONT_SIZE }
