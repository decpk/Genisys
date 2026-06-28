import { useMemo, useSyncExternalStore } from 'react'

import { useKeyboardStore } from '../keyboard-store'
import { shortcutRegistry } from '../utils/createShortcutRegistry'
import { keyComboToDisplayString } from '../utils/keyComboToDisplayString'
import type { ShortcutScope, ResolvedShortcut } from '../KeyboardShortcut.types'

// ── Options ──────────────────────────────────────────────────────────

interface UseShortcutsOptions {
  scope?: ShortcutScope
}

// ── Return type ──────────────────────────────────────────────────────

interface UseShortcutsReturn {
  shortcuts: ResolvedShortcut[]
  getShortcutDisplay: (id: string) => string[]
}

// ── Read shortcuts (Pattern B) ───────────────────────────────────────

export function useShortcuts(options?: UseShortcutsOptions): UseShortcutsReturn {
  const overrides = useKeyboardStore((s) => s.overrides)
  const disabledShortcuts = useKeyboardStore((s) => s.disabledShortcuts)
  const scope = options?.scope

  // Subscribe to registry changes
  const defs = useSyncExternalStore(
    shortcutRegistry.subscribe,
    shortcutRegistry.getAll
  )

  const shortcuts = useMemo<ResolvedShortcut[]>(() => {
    const filtered = scope
      ? defs.filter((d) => d.scope === scope)
      : defs

    return filtered.map((def) => ({
      ...def,
      keys: overrides[def.id] ?? def.defaultKeys,
      isOverridden: def.id in overrides,
      isDisabled: disabledShortcuts.includes(def.id),
      conflicts: [],
    }))
  }, [defs, overrides, disabledShortcuts, scope])

  const getShortcutDisplay = useMemo(() => {
    return (id: string): string[] => {
      const shortcut = shortcuts.find((s) => s.id === id)
      if (!shortcut) return []
      return keyComboToDisplayString(shortcut.keys)
    }
  }, [shortcuts])

  return { shortcuts, getShortcutDisplay }
}
