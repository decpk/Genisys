/**
 * Returns true if the keydown event represents a single printable character
 * (letter, digit, punctuation) without modifier keys — i.e. a candidate for
 * type-ahead search. Excludes named keys ('Enter', 'ArrowDown', etc.) and
 * any key with Ctrl/Meta/Alt held down.
 */
export function isPrintableTypeAheadKey(event: KeyboardEvent): boolean {
  if (event.ctrlKey || event.metaKey || event.altKey) return false
  if (event.key.length !== 1) return false
  // Ignore plain space — it would conflict with row activation when bubbling.
  if (event.key === ' ') return false
  return true
}
