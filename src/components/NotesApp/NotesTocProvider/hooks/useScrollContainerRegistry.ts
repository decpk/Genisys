import { useCallback, useRef } from 'react'

export function useScrollContainerRegistry() {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const registerScrollContainer = useCallback((el: HTMLDivElement | null) => {
    scrollContainerRef.current = el
  }, [])

  return { scrollContainerRef, registerScrollContainer }
}
