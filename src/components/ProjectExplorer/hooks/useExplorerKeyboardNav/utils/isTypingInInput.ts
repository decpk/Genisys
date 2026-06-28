/**
 * Returns true if the keydown event target is a form input, textarea, select,
 * or contentEditable element — meaning the keyboard nav handler should NOT
 * intercept the key.
 */
export function isTypingInInput(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (target.isContentEditable) return true
  return false
}
