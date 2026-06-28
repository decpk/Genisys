import type { PaletteKind, PaletteMode } from '@/components/CommandPalette/CommandPalette.types'

export interface CommandPaletteState {
  isOpen: boolean
  /** The mode the palette opened in (Cmd+P vs Cmd+Shift+P). */
  initialMode: PaletteMode
  /** The currently effective mode (may flip when user types `>`). */
  mode: PaletteMode
  /** Optional kind filter active when user typed `@<kind>`. */
  kindFilter: PaletteKind | null
  /** The raw query string as typed (includes `>` / `@` prefix). */
  query: string
  /** Cleaned query (prefixes stripped) — used by the search hook. */
  cleanedQuery: string
  /** Highlighted index inside the visible result list. */
  selectedIndex: number
}

export interface CommandPaletteActions {
  openQuickOpen: () => void
  openCommands: () => void
  toggleQuickOpen: () => void
  toggleCommands: () => void
  close: () => void
  setQuery: (query: string) => void
  setSelectedIndex: (index: number) => void
  setKindFilter: (kind: PaletteKind | null) => void
}

export type CommandPaletteStore = CommandPaletteState & CommandPaletteActions
