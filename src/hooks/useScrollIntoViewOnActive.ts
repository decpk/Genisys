import { useEffect, useRef } from 'react'

/**
 * Returns a ref to attach to an element. The first time `active` becomes true
 * for the mounted element, it scrolls the element into view (once). Useful for
 * revealing a restored/selected item inside a scrollable list on mount.
 */
export function useScrollIntoViewOnActive<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null)
  const hasScrolledRef = useRef(false)

  useEffect(() => {
    if (!active || hasScrolledRef.current) return
    const el = ref.current
    if (!el) return
    hasScrolledRef.current = true
    el.scrollIntoView({ block: 'nearest' })
  }, [active])

  return ref
}
