import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'

// ── Mode & kinds ─────────────────────────────────────────────────────

export type PaletteMode = 'quick-open' | 'commands'

export type PaletteKind =
  | 'app'
  | 'note'
  | 'book'
  | 'chapter'
  | 'task'
  | 'meeting'
  | 'apirequest'
  | 'mockendpoint'
  | 'bookmark'
  | 'chat'
  | 'clipboard'
  | 'command'
  | 'theme'

export type PaletteGroup = 'recent' | 'navigate' | 'commands' | 'create' | 'theme' | 'view'

// ── Kind config ──────────────────────────────────────────────────────

export interface PaletteKindConfig {
  kind: PaletteKind
  label: string
  pluralLabel: string
  /** Aliases used after `@` for quick-filtering (e.g. `@notes`, `@books`). */
  aliases: string[]
  icon: LucideIcon | ComponentType<{ size?: number; className?: string }>
  /** Tailwind text-color class for the icon. */
  iconColor?: string
  /** Whether this kind is shown in Quick Open by default. */
  inQuickOpen: boolean
  /** Whether this kind is shown in Command Palette by default. */
  inCommands: boolean
}

// ── Item shape ───────────────────────────────────────────────────────

export interface PaletteItem {
  /** Unique across all kinds: `${kind}:${entityId}`. */
  id: string
  kind: PaletteKind
  title: string
  subtitle?: string
  description?: string
  icon?: LucideIcon | ComponentType<{ size?: number; className?: string }>
  iconColor?: string
  /** Pre-formatted display string, e.g. "⌘B". */
  keybinding?: string
  /** Extra terms used to boost fuzzy matching. */
  keywords?: string[]
  group: PaletteGroup
  /** Sort hint for grouping in empty-query view. Higher = surfaced earlier. */
  weight?: number
  action: () => void | Promise<void>
}

// ── Source ───────────────────────────────────────────────────────────

export interface PaletteSource {
  /** Stable id used for one-shot lazy load tracking. */
  id: string
  kinds: PaletteKind[]
  /** Returns the items for this source for the current store snapshot. */
  getItems: () => PaletteItem[]
  /** Optional one-shot loader called the first time the palette opens. */
  load?: () => Promise<void> | void
}

// ── Parsed query ─────────────────────────────────────────────────────

export interface ParsedPaletteQuery {
  mode: PaletteMode
  kindFilter: PaletteKind | null
  cleanedQuery: string
}

// ── Recents ──────────────────────────────────────────────────────────

export interface RecentEntry {
  id: string
  kind: PaletteKind
  ts: number
}
