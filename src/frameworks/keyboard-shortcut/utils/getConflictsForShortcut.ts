import type { ResolvedShortcut, ShortcutScope } from '../KeyboardShortcut.types'

import { detectConflicts } from './detectConflicts'

// ── Get conflicts for a single shortcut ──────────────────────────────

export function getConflictsForShortcut(
  id: string,
  allShortcuts: ResolvedShortcut[],
  activeApp: ShortcutScope
): string[] {
  const groups = detectConflicts(allShortcuts, activeApp)
  const group = groups.find((g) => g.shortcutIds.includes(id))
  if (!group) return []
  return group.shortcutIds.filter((sid) => sid !== id)
}
