import type { ResolvedShortcut, ConflictGroup, ShortcutScope } from '../KeyboardShortcut.types'

import { isChordPrefix } from './isChordPrefix'
import { normalizeKeyChord } from './normalizeKeyChord'
import { scopesOverlap } from './scopesOverlap'

// ── Conflict detection ───────────────────────────────────────────────

export function detectConflicts(
  shortcuts: ResolvedShortcut[],
  activeApp: ShortcutScope
): ConflictGroup[] {
  // Group by normalized key chord
  const byKey = new Map<string, ResolvedShortcut[]>()

  for (const shortcut of shortcuts) {
    if (shortcut.isDisabled) continue
    const normalized = normalizeKeyChord(shortcut.keys)
    if (!normalized) continue
    const group = byKey.get(normalized)
    if (group) {
      group.push(shortcut)
    } else {
      byKey.set(normalized, [shortcut])
    }
  }

  const conflicts: ConflictGroup[] = []

  // Pass 1: same-key conflicts (existing behaviour).
  for (const [normalizedKey, group] of byKey) {
    if (group.length < 2) continue

    // Find pairs that actually conflict (overlapping scopes)
    const conflictingIds = new Set<string>()

    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        if (scopesOverlap(group[i].scope, group[j].scope, activeApp)) {
          conflictingIds.add(group[i].id)
          conflictingIds.add(group[j].id)
        }
      }
    }

    if (conflictingIds.size > 0) {
      conflicts.push({ normalizedKey, shortcutIds: Array.from(conflictingIds) })
    }
  }

  // Pass 2: chord-prefix conflicts. A single-combo binding equal to the
  // first combo of a 2-combo chord binding blocks the chord from ever
  // firing — flag both.
  const entries = Array.from(byKey.entries())
  const prefixConflictByPair = new Map<string, ConflictGroup>()

  for (let i = 0; i < entries.length; i++) {
    for (let j = 0; j < entries.length; j++) {
      if (i === j) continue
      const [shortKey, shortGroup] = entries[i]
      const [longKey, longGroup] = entries[j]
      if (!isChordPrefix(shortKey, longKey)) continue

      for (const a of shortGroup) {
        for (const b of longGroup) {
          if (!scopesOverlap(a.scope, b.scope, activeApp)) continue
          const pairKey = `prefix-of:${shortKey}|${longKey}`
          let group = prefixConflictByPair.get(pairKey)
          if (!group) {
            group = { normalizedKey: pairKey, shortcutIds: [] }
            prefixConflictByPair.set(pairKey, group)
          }
          if (!group.shortcutIds.includes(a.id)) group.shortcutIds.push(a.id)
          if (!group.shortcutIds.includes(b.id)) group.shortcutIds.push(b.id)
        }
      }
    }
  }

  for (const group of prefixConflictByPair.values()) {
    conflicts.push(group)
  }

  return conflicts
}
