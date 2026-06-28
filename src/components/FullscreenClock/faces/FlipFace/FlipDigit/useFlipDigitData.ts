import { useCallback, useRef, useState } from 'react'

import type { FlipDigitData } from './FlipDigit.types'

// Safety net in case `onAnimationEnd` never fires (animation cancelled, tab
// hidden, etc.). Comfortably longer than the actual CSS animation total
// (280ms fall + 280ms delay + 280ms rise = 840ms) but short enough that the
// next second's flip can still start cleanly.
const FLIP_SAFETY_TIMEOUT_MS = 1100

interface InternalState {
  current: string
  previous: string
  isFlipping: boolean
  flipKey: number
}

export interface FlipDigitDataInternal extends FlipDigitData {
  finishFlip: () => void
}

export function useFlipDigitData(digit: string): FlipDigitDataInternal {
  const [state, setState] = useState<InternalState>(() => ({
    current: digit,
    previous: digit,
    isFlipping: false,
    flipKey: 0,
  }))
  const safetyTimerRef = useRef<number | null>(null)
  const queuedDigitRef = useRef<string | null>(null)

  // Schedule (or re-arm) the safety timeout that finalises a flip if the
  // animation event somehow never arrives.
  const armSafety = useCallback(() => {
    if (safetyTimerRef.current) window.clearTimeout(safetyTimerRef.current)
    safetyTimerRef.current = window.setTimeout(() => {
      finishFlipRef.current()
    }, FLIP_SAFETY_TIMEOUT_MS)
  }, [])

  // Render-time detection of digit changes. If we're already flipping, queue
  // the latest value so we can chain into a new flip the moment this one
  // settles — this prevents fast successive ticks from getting lost.
  if (state.current !== digit) {
    if (state.isFlipping) {
      queuedDigitRef.current = digit
    } else {
      setState((prev) => ({
        current: digit,
        previous: prev.current,
        isFlipping: true,
        flipKey: prev.flipKey + 1,
      }))
      armSafety()
    }
  }

  const finishFlip = useCallback(() => {
    if (safetyTimerRef.current) {
      window.clearTimeout(safetyTimerRef.current)
      safetyTimerRef.current = null
    }
    setState((prev) => {
      const queued = queuedDigitRef.current
      queuedDigitRef.current = null
      // A new digit arrived mid-flight — kick straight into the next flip.
      if (queued !== null && queued !== prev.current) {
        armSafety()
        return {
          current: queued,
          previous: prev.current,
          isFlipping: true,
          flipKey: prev.flipKey + 1,
        }
      }
      // Otherwise settle.
      return {
        ...prev,
        previous: prev.current,
        isFlipping: false,
      }
    })
  }, [armSafety])

  // Keep a stable ref to finishFlip so armSafety doesn't need to depend on it.
  const finishFlipRef = useRef(finishFlip)
  finishFlipRef.current = finishFlip

  return {
    current: state.current,
    previous: state.previous,
    isFlipping: state.isFlipping,
    flipKey: state.flipKey,
    finishFlip,
  }
}
