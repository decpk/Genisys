import { useEffect, type RefObject } from 'react'

/**
 * Fires `onOutside` when a `mousedown`/`touchstart` occurs outside the
 * referenced element while `enabled` is `true`. Use to dismiss popovers
 * or menus on outside interaction.
 *
 * NOTE: This is intentionally NOT used by the Settings side panel —
 * a non-modal drawer that closes on any outside click would dismiss
 * itself on every keystroke in the host app. Drawers use Esc + an
 * explicit close button instead. Kept here for genuinely modal usages.
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onOutside: () => void,
  enabled: boolean = true,
): void {
  useEffect(() => {
    if (!enabled) return
    const handle = (e: MouseEvent | TouchEvent): void => {
      const node = ref.current
      if (!node) return
      if (node.contains(e.target as Node)) return
      onOutside()
    }
    document.addEventListener('mousedown', handle)
    document.addEventListener('touchstart', handle)
    return () => {
      document.removeEventListener('mousedown', handle)
      document.removeEventListener('touchstart', handle)
    }
  }, [ref, onOutside, enabled])
}
