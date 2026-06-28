import { useEffect, useState } from 'react'
import type { Editor } from '@tiptap/react'

import { extractTocItemsFromDoc } from '../utils/extractTocItemsFromDoc'
import type { NotesTocPositionedItem } from '../NotesTocProvider.types'

const EMPTY_ITEMS: NotesTocPositionedItem[] = []
const DEBOUNCE_MS = 150

/**
 * Subscribes to the editor's update/create events and emits a debounced
 * `TocItem[]` derived from the current ProseMirror document. Returns a stable
 * `EMPTY_ITEMS` reference when no editor is registered (so consumers that
 * depend on the array reference don't see a fresh `[]` every render).
 */
export function useNotesTocItems(editor: Editor | null): NotesTocPositionedItem[] {
  const [items, setItems] = useState<NotesTocPositionedItem[]>(EMPTY_ITEMS)

  useEffect(() => {
    if (!editor) {
      setItems(EMPTY_ITEMS)
      return
    }

    let timer: number | null = null

    const run = () => {
      timer = null
      if (editor.isDestroyed) return
      setItems(extractTocItemsFromDoc(editor.state.doc))
    }

    const schedule = () => {
      if (timer !== null) window.clearTimeout(timer)
      timer = window.setTimeout(run, DEBOUNCE_MS)
    }

    // Initial extraction is synchronous so the panel paints with content
    // immediately on mount or note switch.
    setItems(extractTocItemsFromDoc(editor.state.doc))

    editor.on('update', schedule)
    editor.on('create', schedule)

    return () => {
      if (timer !== null) window.clearTimeout(timer)
      editor.off('update', schedule)
      editor.off('create', schedule)
    }
  }, [editor])

  return items
}
