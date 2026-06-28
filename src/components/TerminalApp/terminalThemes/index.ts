import { TERMINAL_THEMES } from './terminalThemes.constants'
import type { TerminalTheme, TerminalThemeGroup } from './terminalThemes.types'

export { TERMINAL_THEMES } from './terminalThemes.constants'
export { TerminalThemeSwatch } from './TerminalThemeSwatch'
export type {
  TerminalTheme,
  TerminalThemeColors,
  TerminalThemeGroup,
} from './terminalThemes.types'

/** The fully-populated xterm.js theme shape produced from a `TerminalTheme`. */
export interface XtermTabTheme {
  background: string
  foreground: string
  cursor: string
  cursorAccent: string
  selectionBackground: string
  black: string
  red: string
  green: string
  yellow: string
  blue: string
  magenta: string
  cyan: string
  white: string
  brightBlack: string
  brightRed: string
  brightGreen: string
  brightYellow: string
  brightBlue: string
  brightMagenta: string
  brightCyan: string
  brightWhite: string
}

/** Look up a terminal theme by id. Returns `undefined` for unknown / cleared ids. */
export function findTerminalThemeById(
  id: string | null | undefined,
): TerminalTheme | undefined {
  if (!id) return undefined
  return TERMINAL_THEMES.find((t) => t.id === id)
}

/** Convert a `TerminalTheme` into an xterm.js `ITheme` (cursorAccent → background). */
export function toXtermTheme(theme: TerminalTheme): XtermTabTheme {
  const c = theme.colors
  return {
    background: c.background,
    foreground: c.foreground,
    cursor: c.cursor,
    cursorAccent: c.cursorAccent ?? c.background,
    selectionBackground: c.selectionBackground,
    black: c.black,
    red: c.red,
    green: c.green,
    yellow: c.yellow,
    blue: c.blue,
    magenta: c.magenta,
    cyan: c.cyan,
    white: c.white,
    brightBlack: c.brightBlack,
    brightRed: c.brightRed,
    brightGreen: c.brightGreen,
    brightYellow: c.brightYellow,
    brightBlue: c.brightBlue,
    brightMagenta: c.brightMagenta,
    brightCyan: c.brightCyan,
    brightWhite: c.brightWhite,
  }
}

/** Display order of the menu sections. */
const TERMINAL_THEME_GROUP_ORDER: TerminalThemeGroup[] = [
  'Popular',
  'Modern',
  'Vibrant',
  'macOS',
  'Windows',
  'Linux',
  'Light',
]

/** Themes bucketed by group, in menu display order, skipping empty groups. */
export const TERMINAL_THEME_GROUPS: { group: TerminalThemeGroup; themes: TerminalTheme[] }[] =
  TERMINAL_THEME_GROUP_ORDER.map((group) => ({
    group,
    themes: TERMINAL_THEMES.filter((t) => t.group === group),
  })).filter((g) => g.themes.length > 0)
