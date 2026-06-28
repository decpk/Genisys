import type { AppView } from '@/store/settings-store'

// ── Scope ────────────────────────────────────────────────────────────

export type ShortcutScope = 'global' | AppView

// ── Key Combo ────────────────────────────────────────────────────────

export interface KeyCombo {
  mod: boolean
  ctrl: boolean
  alt: boolean
  shift: boolean
  key: string
}

// ── Key Chord ────────────────────────────────────────────────────────

/** A sequence of one or more KeyCombos (e.g. ["Mod+K", "W"]). */
export type KeyChord = KeyCombo[]

// ── Shortcut Definition ──────────────────────────────────────────────

export interface ShortcutDef {
  id: string
  label: string
  description?: string
  scope: ShortcutScope
  defaultKeys: string
  category?: string
  allowInInput?: boolean
}

// ── Override ─────────────────────────────────────────────────────────

export interface ShortcutOverride {
  id: string
  keys: string
}

// ── Resolved (runtime) ──────────────────────────────────────────────

export interface ResolvedShortcut extends ShortcutDef {
  keys: string
  isOverridden: boolean
  isDisabled: boolean
  conflicts: string[]
}

// ── Conflict ─────────────────────────────────────────────────────────

export interface ConflictGroup {
  normalizedKey: string
  shortcutIds: string[]
}

// ── Action Map ───────────────────────────────────────────────────────

export type ShortcutActionMap = Record<string, () => void>

// ── Registry change listener ─────────────────────────────────────────

export type RegistryListener = () => void

// ── Registry ─────────────────────────────────────────────────────────

export interface ShortcutRegistry {
  register: (defs: ShortcutDef[]) => void
  unregister: (ids: string[]) => void
  getAll: () => ShortcutDef[]
  getByScope: (scope: ShortcutScope) => ShortcutDef[]
  getById: (id: string) => ShortcutDef | undefined
  subscribe: (listener: RegistryListener) => () => void
}
