import type { ShortcutScope } from '../KeyboardShortcut.types'

// ── Scope overlap check ──────────────────────────────────────────────

export function scopesOverlap(a: ShortcutScope, b: ShortcutScope, activeApp: ShortcutScope): boolean {
  // Both global → conflict
  if (a === 'global' && b === 'global') return true

  // Same app scope → conflict
  if (a === b) return true

  // One global + one is the active app → conflict (global gets shadowed)
  if (a === 'global' && b === activeApp) return true
  if (b === 'global' && a === activeApp) return true

  // Different app scopes → no conflict
  return false
}
