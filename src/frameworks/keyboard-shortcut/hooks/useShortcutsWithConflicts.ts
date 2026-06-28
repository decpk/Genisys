import { useMemo } from 'react'

import type { ShortcutScope, ResolvedShortcut } from '../KeyboardShortcut.types'
import { useShortcuts } from './useShortcuts'
import { detectConflicts } from '../utils/detectConflicts'

// ── Read all shortcuts with conflict info ────────────────────────────

export function useShortcutsWithConflicts(activeApp: ShortcutScope): ResolvedShortcut[] {
  const { shortcuts } = useShortcuts()

  return useMemo(() => {
    const groups = detectConflicts(shortcuts, activeApp)
    const conflictMap = new Map<string, string[]>()

    for (const group of groups) {
      for (const id of group.shortcutIds) {
        const others = group.shortcutIds.filter((sid) => sid !== id)
        const existing = conflictMap.get(id) ?? []
        conflictMap.set(id, [...existing, ...others])
      }
    }

    return shortcuts.map((s) => ({
      ...s,
      conflicts: conflictMap.get(s.id) ?? [],
    }))
  }, [shortcuts, activeApp])
}
