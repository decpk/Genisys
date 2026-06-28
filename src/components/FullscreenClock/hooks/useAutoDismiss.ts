import { useEffect, useRef } from 'react'

interface AutoDismissOptions {
  /** Fired when the modal is about to leave (leaveBeforeMs before dismiss). */
  onLeave?: () => void
  /** Fired whenever the dismiss timer resets (user interaction). */
  onReset?: () => void
  /** How many ms before dismiss to trigger the leave callback. */
  leaveBeforeMs?: number
}

export function useAutoDismiss(
  active: boolean,
  timeoutMs: number,
  onDismiss: () => void,
  options?: AutoDismissOptions,
): void {
  const dismissTimerRef = useRef<number | null>(null)
  const leaveTimerRef = useRef<number | null>(null)
  // Once the leave timer fires we lock the schedule — further user input
  // (mousemove / touchstart) must NOT pull the modal back from PiP.
  // Otherwise the user sees a jarring bounce: PiP → full → PiP → dismiss.
  const isLeavingRef = useRef(false)

  // Mirror callbacks/options in refs so the effect can stay stable.
  const onDismissRef = useRef(onDismiss)
  const onLeaveRef = useRef(options?.onLeave)
  const onResetRef = useRef(options?.onReset)
  const leaveBeforeMsRef = useRef(options?.leaveBeforeMs ?? 0)

  useEffect(() => {
    onDismissRef.current = onDismiss
    onLeaveRef.current = options?.onLeave
    onResetRef.current = options?.onReset
    leaveBeforeMsRef.current = options?.leaveBeforeMs ?? 0
  }, [onDismiss, options?.onLeave, options?.onReset, options?.leaveBeforeMs])

  useEffect(() => {
    if (!active) {
      isLeavingRef.current = false
      return
    }

    const arm = (): void => {
      if (dismissTimerRef.current) window.clearTimeout(dismissTimerRef.current)
      if (leaveTimerRef.current) window.clearTimeout(leaveTimerRef.current)
      isLeavingRef.current = false
      onResetRef.current?.()

      const leaveDelay = Math.max(0, timeoutMs - leaveBeforeMsRef.current)
      if (leaveBeforeMsRef.current > 0 && leaveBeforeMsRef.current < timeoutMs) {
        leaveTimerRef.current = window.setTimeout(() => {
          isLeavingRef.current = true
          onLeaveRef.current?.()
        }, leaveDelay)
      }
      dismissTimerRef.current = window.setTimeout(() => onDismissRef.current(), timeoutMs)
    }
    arm()

    const reset = (): void => {
      // Already in the PiP "leaving" phase — ignore further input so the
      // user sees a single smooth shrink-then-slide, not a bounce.
      if (isLeavingRef.current) return
      arm()
    }
    window.addEventListener('mousemove', reset)
    window.addEventListener('touchstart', reset)

    return () => {
      window.removeEventListener('mousemove', reset)
      window.removeEventListener('touchstart', reset)
      if (dismissTimerRef.current) {
        window.clearTimeout(dismissTimerRef.current)
        dismissTimerRef.current = null
      }
      if (leaveTimerRef.current) {
        window.clearTimeout(leaveTimerRef.current)
        leaveTimerRef.current = null
      }
    }
  }, [active, timeoutMs])
}
