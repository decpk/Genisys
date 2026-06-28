import { useCallback, useRef } from 'react'

// Module-level storage so history persists across component remounts
const promptHistory: string[] = []

export function usePromptHistory(): {
  addToHistory: (prompt: string) => void
  navigateUp: (currentInput: string) => string | null
  navigateDown: () => string | null
  resetNavigation: () => void
} {
  const indexRef = useRef(-1)
  const draftRef = useRef('')

  const addToHistory = useCallback((prompt: string) => {
    // Avoid consecutive duplicates
    if (promptHistory.length > 0 && promptHistory[promptHistory.length - 1] === prompt) return
    promptHistory.push(prompt)
    indexRef.current = -1
    draftRef.current = ''
  }, [])

  const navigateUp = useCallback((currentInput: string): string | null => {
    if (promptHistory.length === 0) return null

    // Save draft when starting to navigate
    if (indexRef.current === -1) {
      draftRef.current = currentInput
      indexRef.current = promptHistory.length - 1
    } else if (indexRef.current > 0) {
      indexRef.current -= 1
    } else {
      return null // Already at oldest
    }

    return promptHistory[indexRef.current]
  }, [])

  const navigateDown = useCallback((): string | null => {
    if (indexRef.current === -1) return null

    if (indexRef.current < promptHistory.length - 1) {
      indexRef.current += 1
      return promptHistory[indexRef.current]
    }

    // Past the newest entry — restore draft
    indexRef.current = -1
    return draftRef.current
  }, [])

  const resetNavigation = useCallback(() => {
    indexRef.current = -1
    draftRef.current = ''
  }, [])

  return { addToHistory, navigateUp, navigateDown, resetNavigation }
}
