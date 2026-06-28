import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

import { isTypingInInput } from '../../../hooks/useExplorerKeyboardNav/utils/isTypingInInput'
import { matchExplorerShortcut } from '../utils/matchExplorerShortcut'
import type { ExplorerShortcutAction } from '../ExplorerKeyboardOperations.types'

interface UseExplorerOperationsKeyListenerParams {
  containerRef: RefObject<HTMLElement | null>
  enabled: boolean
  isDialogOpen: boolean
  onAction: (action: ExplorerShortcutAction) => void
}

export function useExplorerOperationsKeyListener(params: UseExplorerOperationsKeyListenerParams): void {
  const { containerRef, enabled, isDialogOpen, onAction } = params

  const enabledRef = useRef(enabled)
  const isDialogOpenRef = useRef(isDialogOpen)
  const onActionRef = useRef(onAction)

  useEffect(() => {
    enabledRef.current = enabled
    isDialogOpenRef.current = isDialogOpen
    onActionRef.current = onAction
  }, [enabled, isDialogOpen, onAction])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!enabledRef.current) return
      if (isDialogOpenRef.current) return
      if (isTypingInInput(event.target)) return

      const action = matchExplorerShortcut(event)
      if (action === null) return

      event.preventDefault()
      event.stopPropagation()
      onActionRef.current(action)
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [containerRef])
}
