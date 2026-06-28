import { useEffect, useRef, useState } from 'react'

interface MountTransition {
  mounted: boolean
  visible: boolean
}

// Long enough to comfortably cover the PiP slide-down exit transition
// configured in getCardTransform (PIP_EXIT_DURATION_MS ≈ 520ms).
const EXIT_DURATION_MS = 600

export function useMountTransition(isOpen: boolean): MountTransition {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const exitTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (isOpen) {
      if (exitTimerRef.current) {
        window.clearTimeout(exitTimerRef.current)
        exitTimerRef.current = null
      }
      setMounted(true)
      const raf = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(raf)
    }

    setVisible(false)
    exitTimerRef.current = window.setTimeout(() => setMounted(false), EXIT_DURATION_MS)
    return () => {
      if (exitTimerRef.current) {
        window.clearTimeout(exitTimerRef.current)
        exitTimerRef.current = null
      }
    }
  }, [isOpen])

  return { mounted, visible }
}
