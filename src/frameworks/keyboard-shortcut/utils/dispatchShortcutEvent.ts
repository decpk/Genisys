import type { ResolvedShortcut } from '../KeyboardShortcut.types'

import { clearChordPrefix } from './chord-state/clearChordPrefix'
import { getChordPrefix } from './chord-state/getChordPrefix'
import { setChordPrefix } from './chord-state/setChordPrefix'
import { combosEqual } from './combosEqual'
import { isInputFocused } from './isInputFocused'
import { isPureModifierEvent } from './isPureModifierEvent'
import { matchesEvent } from './matchesEvent'
import { parseKeyChord } from './parseKeyChord'

export interface DispatchResult {
  /** True when the event matched a binding (or was the first half of a chord). */
  handled: boolean
  /** Shortcut id of the matched action — undefined for pending chord prefix. */
  matchedId?: string
}

/**
 * Run the shortcut dispatch logic for a single KeyboardEvent.
 *
 * - Single-combo bindings dispatch immediately.
 * - 2-combo (chord) bindings: first matching keydown sets a pending
 *   prefix; second matching keydown within CHORD_TIMEOUT_MS fires the
 *   action. Any non-matching key (other than pure modifier presses)
 *   while a prefix is pending cancels the chord.
 *
 * `runAction` is invoked with the matched shortcut id; callers can map
 * that to the action map.
 */
export function dispatchShortcutEvent(
  event: KeyboardEvent,
  candidates: ResolvedShortcut[],
  runAction: (id: string) => boolean
): DispatchResult {
  // Ignore modifier-only keydowns entirely — they don't advance the chord.
  if (isPureModifierEvent(event)) {
    return { handled: false }
  }

  const pendingPrefix = getChordPrefix()

  if (pendingPrefix) {
    // Second key of a potential chord. Look for any chord candidate whose
    // first combo equals pendingPrefix and whose second combo matches event.
    for (const shortcut of candidates) {
      const chord = parseKeyChord(shortcut.keys)
      if (chord.length !== 2) continue
      if (!combosEqual(chord[0], pendingPrefix)) continue
      if (!matchesEvent(chord[1], event)) continue
      if (!shortcut.allowInInput && isInputFocused()) continue
      clearChordPrefix()
      const ran = runAction(shortcut.id)
      if (ran) return { handled: true, matchedId: shortcut.id }
      return { handled: false }
    }
    // No second-key match — cancel chord. Caller should NOT preventDefault
    // because the user may want this fallback key to do its normal thing.
    clearChordPrefix()
    return { handled: false }
  }

  // No pending prefix. Try single-combo bindings first; if none match,
  // try setting a chord prefix.
  for (const shortcut of candidates) {
    const chord = parseKeyChord(shortcut.keys)
    if (chord.length !== 1) continue
    if (!matchesEvent(chord[0], event)) continue
    if (!shortcut.allowInInput && isInputFocused()) continue
    const ran = runAction(shortcut.id)
    if (ran) return { handled: true, matchedId: shortcut.id }
  }

  // No single-combo match — see if this event starts any chord prefix.
  for (const shortcut of candidates) {
    const chord = parseKeyChord(shortcut.keys)
    if (chord.length < 2) continue
    if (!matchesEvent(chord[0], event)) continue
    if (!shortcut.allowInInput && isInputFocused()) continue
    setChordPrefix(chord[0])
    return { handled: true }
  }

  return { handled: false }
}
