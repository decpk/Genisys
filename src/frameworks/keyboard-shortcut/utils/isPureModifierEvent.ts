/**
 * True when the key event is a press of a modifier key alone
 * (Meta / Control / Alt / Shift). Used to ignore filler keydowns
 * between chord steps.
 */
export function isPureModifierEvent(event: KeyboardEvent): boolean {
  const k = event.key.toLowerCase()
  return k === 'meta' || k === 'control' || k === 'alt' || k === 'shift'
}
