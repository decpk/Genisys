import type { ResolvedShortcut } from '../KeyboardShortcut.types'

import { useKeyboardStore } from '../keyboard-store'
import { shortcutRegistry } from './createShortcutRegistry'
import { parseKeyChord } from './parseKeyChord'

// ── Memoized resolution ──────────────────────────────────────
// resolveShortcuts() runs on every keydown via the global dispatcher, so the
// result is memoized and only rebuilt when the registry changes (shortcuts
// registered/unregistered) or the user's overrides/disabled set changes —
// both rare relative to keystrokes.

let cache: ResolvedShortcut[] | null = null
let plainInputCount = 0
let dirty = true

function markDirty(): void {
  dirty = true
}

// Invalidate the cache on the (rare) events that change resolution.
shortcutRegistry.subscribe(markDirty)
useKeyboardStore.subscribe(markDirty)

function rebuild(): void {
  const defs = shortcutRegistry.getAll()
  const { overrides, disabledShortcuts } = useKeyboardStore.getState()

  const resolved = defs.map((def) => ({
    ...def,
    keys: overrides[def.id] ?? def.defaultKeys,
    isOverridden: def.id in overrides,
    isDisabled: disabledShortcuts.includes(def.id),
    conflicts: [],
  }))

  // Count enabled shortcuts that could fire from a plain keypress while an
  // input is focused: allowInInput AND a first combo with no Mod/Ctrl/Alt.
  // Lets the dispatcher early-out for ordinary typing when this is zero.
  let plain = 0
  for (const s of resolved) {
    if (s.isDisabled || !s.allowInInput) continue
    const first = parseKeyChord(s.keys)[0]
    if (first && !first.mod && !first.ctrl && !first.alt) plain++
  }

  cache = resolved
  plainInputCount = plain
  dirty = false
}

// ── Resolve shortcuts ────────────────────────────────────────

export function resolveShortcuts(): ResolvedShortcut[] {
  if (dirty || !cache) rebuild()
  return cache ?? []
}

/**
 * True when at least one enabled `allowInInput` shortcut can be triggered by
 * a key with no Mod/Ctrl/Alt modifier. When false, the dispatcher can safely
 * skip all work for plain typing inside inputs. Memoized alongside
 * resolveShortcuts().
 */
export function hasPlainInputShortcuts(): boolean {
  if (dirty || !cache) rebuild()
  return plainInputCount > 0
}
