import { useCallback, type MutableRefObject } from 'react'
import type { Editor } from '@tiptap/react'

import type { NotesTocPositionedItem } from '../NotesTocProvider.types'
import { findTocItemPos } from '../utils/findTocItemPos'
import { scrollEditorToPos } from '../utils/scrollEditorToPos'

export function useScrollToTocItem(
  items: NotesTocPositionedItem[],
  editor: Editor | null,
  scrollContainerRef: MutableRefObject<HTMLDivElement | null>,
) {
  return useCallback(
    (id: string) => {
      if (!editor) return
      const container = scrollContainerRef.current
      if (!container) return
      const pos = findTocItemPos(items, id)
      if (pos === null) return
      scrollEditorToPos(editor, pos, container)
    },
    [items, editor, scrollContainerRef],
  )
}
