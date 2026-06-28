import type { KeyCombo } from '../KeyboardShortcut.types'

import { MODIFIER_ORDER } from '../KeyboardShortcut.constants'

// ── Parse ────────────────────────────────────────────────────────────

export function parseKeyCombo(shortcutString: string): KeyCombo {
  const parts = shortcutString.split('+').map((p) => p.trim().toLowerCase())

  return {
    mod: parts.includes('mod'),
    ctrl: parts.includes('ctrl'),
    alt: parts.includes('alt'),
    shift: parts.includes('shift'),
    key: parts.find((p) => !MODIFIER_ORDER.includes(p as (typeof MODIFIER_ORDER)[number])) ?? '',
  }
}
