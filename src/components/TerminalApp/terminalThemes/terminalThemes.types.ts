/**
 * Per-tab terminal color schemes for the standalone Terminal app.
 *
 * These are full xterm.js palettes (background, foreground, cursor, selection
 * and the 16 ANSI colors) modelled on famous developer schemes and the classic
 * macOS Terminal.app profiles. They are deliberately independent of the app-wide
 * `THEMES` (which only recolor the Genisys chrome): a tab can run Dracula while the
 * rest of the app stays on the user's chosen Genisys theme.
 */

/** Menu section a theme is grouped under in the tab context menu. */
export type TerminalThemeGroup =
  | 'Popular'
  | 'Modern'
  | 'Vibrant'
  | 'macOS'
  | 'Windows'
  | 'Linux'
  | 'Light'

/** Full color palette for an xterm surface (maps 1:1 onto xterm's `ITheme`). */
export interface TerminalThemeColors {
  background: string
  foreground: string
  cursor: string
  /** Glyph color under a block cursor. Falls back to `background` when omitted. */
  cursorAccent?: string
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

/** A named terminal color scheme selectable per tab. */
export interface TerminalTheme {
  /** Stable id persisted on the tab (e.g. `dracula`, `macos-pro`). */
  id: string
  /** Human-readable label shown in the context menu. */
  name: string
  /** Menu section the theme is listed under. */
  group: TerminalThemeGroup
  /** Whether the scheme is dark — used for the menu swatch/preview only. */
  isDark: boolean
  colors: TerminalThemeColors
}
