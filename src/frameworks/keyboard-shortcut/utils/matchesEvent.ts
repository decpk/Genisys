import type { KeyCombo } from '../KeyboardShortcut.types'

import { IS_MAC } from '../KeyboardShortcut.constants'
// ── Special key-name aliases ────────────────────────────────────
// Hoisted to module scope so it isn't re-allocated on every match attempt
// (matchesEvent runs for many candidates on every keydown).
const KEY_ALIASES: Record<string, string> = {
  up: 'arrowup',
  down: 'arrowdown',
  left: 'arrowleft',
  right: 'arrowright',
  enter: 'enter',
  escape: 'escape',
  backspace: 'backspace',
  delete: 'delete',
  tab: 'tab',
  space: ' ',
}
// ── Match event ──────────────────────────────────────────────────────

export function matchesEvent(combo: KeyCombo, event: KeyboardEvent): boolean {
  const eventKey = event.key.toLowerCase()

  // Check modifiers
  const modExpected = combo.mod
    ? IS_MAC
      ? event.metaKey
      : event.ctrlKey
    : false

  const ctrlExpected = combo.ctrl ? event.ctrlKey : false
  const altExpected = combo.alt ? event.altKey : false
  const shiftExpected = combo.shift ? event.shiftKey : false

  // Actual modifier state — account for "mod" consuming meta/ctrl
  const modConsumesMeta = combo.mod && IS_MAC
  const modConsumesCtrl = combo.mod && !IS_MAC

  const metaOk = modConsumesMeta ? event.metaKey : !event.metaKey
  const ctrlOk = (combo.ctrl || modConsumesCtrl) ? event.ctrlKey : !event.ctrlKey
  const altOk = combo.alt ? event.altKey : !event.altKey
  const shiftOk = combo.shift ? event.shiftKey : !event.shiftKey

  if (!metaOk || !ctrlOk || !altOk || !shiftOk) return false

  // Check mod was actually pressed
  if (combo.mod && !modExpected) return false
  if (combo.ctrl && !ctrlExpected) return false
  if (combo.alt && !altExpected) return false
  if (combo.shift && !shiftExpected) return false

  // Check the key itself (special key names mapped via module-level aliases)
  const expectedKey = KEY_ALIASES[combo.key] ?? combo.key
  return eventKey === expectedKey
}
