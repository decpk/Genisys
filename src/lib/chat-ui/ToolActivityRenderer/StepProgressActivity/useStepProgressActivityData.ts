import { useState, useCallback } from 'react'

/** Local UI state for a single step row \u2014 just the result expand/collapse toggle. */
export interface UseStepProgressActivityData {
  showResult: boolean
  toggleResult: () => void
}

/** One-concern hook per `.claude.md` \u2014 owns the per-row result expansion. */
export function useStepProgressActivityData(): UseStepProgressActivityData {
  const [showResult, setShowResult] = useState(false)

  const toggleResult = useCallback(() => {
    setShowResult((prev) => !prev)
  }, [])

  return { showResult, toggleResult }
}
