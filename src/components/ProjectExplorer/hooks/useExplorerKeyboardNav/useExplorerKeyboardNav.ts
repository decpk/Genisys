import { useEffect, useMemo, useRef, useState } from 'react'

import { useActivateKeyHandler } from './hooks/useActivateKeyHandler'
import { useArrowKeyHandler } from './hooks/useArrowKeyHandler'
import { useExtremeKeyHandler } from './hooks/useExtremeKeyHandler'
import { useFocusActiveRow } from './hooks/useFocusActiveRow'
import { useGoUpKeyHandler } from './hooks/useGoUpKeyHandler'
import { useNavigateToIndex } from './hooks/useNavigateToIndex'
import { usePageKeyHandler } from './hooks/usePageKeyHandler'
import { useTypeAheadHandler } from './hooks/useTypeAheadHandler'
import type {
  UseExplorerKeyboardNavParams,
  UseExplorerKeyboardNavResult
} from './useExplorerKeyboardNav.types'
import { findIndexByPath } from './utils/findIndexByPath'
import { isTypingInInput } from './utils/isTypingInInput'

/**
 * Orchestrator hook: composes all keyboard-handler sub-hooks, attaches a
 * single keydown listener to the view's scroll container, and drives DOM
 * focus to follow the active item.
 *
 * Each sub-handler returns `true` when it consumes the event; the first
 * truthy handler wins and the event is prevented from default behavior.
 */
export function useExplorerKeyboardNav(
  params: UseExplorerKeyboardNavParams
): UseExplorerKeyboardNavResult {
  const {
    items,
    scrollRef,
    virtualizer,
    columns,
    activePath,
    onActivePathChange,
    onActivate,
    onGoUp
  } = params

  const activeIndex = useMemo(() => findIndexByPath(items, activePath), [items, activePath])

  const navigateToIndex = useNavigateToIndex({
    items,
    columns,
    virtualizer,
    onActivePathChange
  })

  const arrowHandler = useArrowKeyHandler({
    itemCount: items.length,
    columns,
    activeIndex,
    navigateToIndex
  })
  const extremeHandler = useExtremeKeyHandler({ itemCount: items.length, navigateToIndex })
  const pageHandler = usePageKeyHandler({
    itemCount: items.length,
    columns,
    activeIndex,
    scrollRef,
    virtualizer,
    navigateToIndex
  })
  const activateHandler = useActivateKeyHandler({ items, activeIndex, onActivate })
  const goUpHandler = useGoUpKeyHandler({ onGoUp })
  const { handler: typeAheadHandler, reset: resetTypeAhead } = useTypeAheadHandler({
    items,
    activeIndex,
    navigateToIndex
  })

  // Keep handlers in a ref so the keydown listener stays stable (no re-attach per render).
  const handlersRef = useRef({
    arrow: arrowHandler,
    extreme: extremeHandler,
    page: pageHandler,
    activate: activateHandler,
    goUp: goUpHandler,
    typeAhead: typeAheadHandler,
    resetTypeAhead
  })
  useEffect(() => {
    handlersRef.current = {
      arrow: arrowHandler,
      extreme: extremeHandler,
      page: pageHandler,
      activate: activateHandler,
      goUp: goUpHandler,
      typeAhead: typeAheadHandler,
      resetTypeAhead
    }
  })

  // Track whether the user has actually used keyboard navigation. Default
  // selection (first item) shows a visual highlight, but we don't want to
  // steal DOM focus on mount — only follow focus once the user starts pressing
  // navigation keys inside the container.
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const onKeyDown = (event: KeyboardEvent): void => {
      if (isTypingInInput(event.target)) {
        handlersRef.current.resetTypeAhead()
        return
      }
      const h = handlersRef.current
      const consumed =
        h.arrow(event) ||
        h.extreme(event) ||
        h.page(event) ||
        h.activate(event) ||
        h.goUp(event) ||
        h.typeAhead(event)
      if (consumed) {
        setHasInteracted(true)
        event.preventDefault()
        event.stopPropagation()
      }
    }

    container.addEventListener('keydown', onKeyDown)
    return () => container.removeEventListener('keydown', onKeyDown)
  }, [scrollRef])

  useFocusActiveRow({
    activeIndex,
    scrollRef,
    enabled: hasInteracted && activeIndex >= 0
  })

  return { activeIndex }
}
