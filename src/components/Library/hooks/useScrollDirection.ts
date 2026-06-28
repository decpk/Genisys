import { useEffect, useRef, useState } from 'react'

/**
 * Tracks vertical scroll direction on the given scrollable element.
 * Returns 'up' when the user scrolls up, 'down' when scrolling down.
 * Stays at the previous value while idle.
 *
 * Uses a small threshold so micro scrolls / rubber-band don't flip direction.
 */
export function useScrollDirection(
  ref: React.RefObject<HTMLElement | null>,
  threshold = 4,
): 'up' | 'down' {
  const [direction, setDirection] = useState<'up' | 'down'>('up')
  const lastY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    lastY.current = el.scrollTop

    const onScroll = (): void => {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        const y = el.scrollTop
        const dy = y - lastY.current
        if (Math.abs(dy) >= threshold) {
          setDirection(dy > 0 && y > 24 ? 'down' : 'up')
          lastY.current = y
        }
        ticking.current = false
      })
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [ref, threshold])

  return direction
}
