import { useMemo } from 'react'
import type { NotesTocContextValue } from './NotesTocProvider.types'
import { useEditorRegistry } from './hooks/useEditorRegistry'
import { useScrollContainerRegistry } from './hooks/useScrollContainerRegistry'
import { useNotesTocItems } from './hooks/useNotesTocItems'
import { useNotesActiveTocId } from './hooks/useNotesActiveTocId'
import { useScrollToTocItem } from './hooks/useScrollToTocItem'

export function useNotesTocProviderData(): NotesTocContextValue {
  const { editor, registerEditor } = useEditorRegistry()
  const { scrollContainerRef, registerScrollContainer } = useScrollContainerRegistry()
  const items = useNotesTocItems(editor)
  const { getActiveItemId, subscribeActiveItem } = useNotesActiveTocId(
    items,
    editor,
    scrollContainerRef,
  )
  const scrollToItem = useScrollToTocItem(items, editor, scrollContainerRef)

  return useMemo(
    () => ({
      editor,
      registerEditor,
      registerScrollContainer,
      scrollContainerRef,
      items,
      getActiveItemId,
      subscribeActiveItem,
      scrollToItem,
    }),
    [
      editor,
      registerEditor,
      registerScrollContainer,
      scrollContainerRef,
      items,
      getActiveItemId,
      subscribeActiveItem,
      scrollToItem,
    ],
  )
}
