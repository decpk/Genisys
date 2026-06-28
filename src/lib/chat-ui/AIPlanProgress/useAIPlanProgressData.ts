import { useCallback, useMemo, useState } from 'react'

import type { AIPlanStep } from './AIPlanProgress.types'
import { countDoneSteps } from './utils/countDoneSteps'

interface UseAIPlanProgressData {
  /** Number of steps whose status is `done`. */
  doneCount: number
  /** Total step count. */
  total: number
  /** Whether the todo body is expanded. */
  expanded: boolean
  /** Toggle handler wired to the header button. */
  toggleExpanded: () => void
}

/**
 * Orchestrator hook for `AIPlanProgress`. Computes the (done / total)
 * summary used in the header and owns the body's expanded/collapsed
 * state (default: expanded so the user can watch progress live).
 */
export function useAIPlanProgressData(
  steps: AIPlanStep[],
): UseAIPlanProgressData {
  const [expanded, setExpanded] = useState(true)

  const doneCount = useMemo<number>(
    () => countDoneSteps(steps),
    [steps],
  )

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev)
  }, [])

  return {
    doneCount,
    total: steps.length,
    expanded,
    toggleExpanded,
  }
}
