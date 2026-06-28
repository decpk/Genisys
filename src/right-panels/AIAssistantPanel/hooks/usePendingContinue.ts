import { useCallback, useRef, useState } from 'react'

import type { AIContinueRequest } from '../AIAssistantPanel.types'

export interface UsePendingContinueReturn {
  /** Current pending continue request (or `null` when none). */
  pendingContinue: AIContinueRequest | null
  /** User clicked "Continue" — resolves the pending promise with `true`. */
  continueLoop: () => void
  /** User clicked "Stop & answer" — resolves the pending promise with `false`. */
  stopLoop: () => void
  /**
   * Callback to pass into the agentic-loop runner as `onContinueRequired`.
   * When the loop exhausts its budget it calls this and awaits the
   * resolved boolean.
   */
  onContinueRequired: (info: AIContinueRequest) => Promise<boolean>
  /** Drop any in-flight resolver and clear pending state — call on session reset. */
  reset: () => void
}

/**
 * Owns the "tool-budget exhausted, continue?" UX state for an AI panel.
 * The runner calls `onContinueRequired` and awaits a boolean; the user's
 * click on `<ContinuePanel>` resolves it.
 */
export function usePendingContinue(): UsePendingContinueReturn {
  const [pendingContinue, setPendingContinue] = useState<AIContinueRequest | null>(null)
  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const onContinueRequired = useCallback(
    (info: AIContinueRequest) =>
      new Promise<boolean>((resolve) => {
        setPendingContinue(info)
        resolverRef.current = resolve
      }),
    [],
  )

  const continueLoop = useCallback(() => {
    const resolve = resolverRef.current
    resolverRef.current = null
    setPendingContinue(null)
    if (resolve) resolve(true)
  }, [])

  const stopLoop = useCallback(() => {
    const resolve = resolverRef.current
    resolverRef.current = null
    setPendingContinue(null)
    if (resolve) resolve(false)
  }, [])

  const reset = useCallback(() => {
    const resolve = resolverRef.current
    resolverRef.current = null
    setPendingContinue(null)
    if (resolve) resolve(false)
  }, [])

  return { pendingContinue, continueLoop, stopLoop, onContinueRequired, reset }
}
