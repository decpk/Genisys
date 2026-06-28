import { useCallback, useEffect, useRef, type MutableRefObject } from 'react'
import type { Editor } from '@tiptap/react'

import type { NotesTocPositionedItem } from '../NotesTocProvider.types'

interface ActiveTocApi {
  getActiveItemId: () => string | null
  subscribeActiveItem: (cb: () => void) => () => void
}

/**
 * Tracks the currently-active TOC item using IntersectionObserver on the
 * resolved DOM nodes of each item's ProseMirror position. Exposes a
 * subscribe-pattern API so consumers can hook into changes via
 * `useSyncExternalStore` without re-rendering the whole provider tree.
 */
export function useNotesActiveTocId(
  items: NotesTocPositionedItem[],
  editor: Editor | null,
  scrollContainerRef: MutableRefObject<HTMLDivElement | null>,
): ActiveTocApi {
  const activeIdRef = useRef<string | null>(null)
  const listenersRef = useRef<Set<() => void>>(new Set())

  const setActive = useCallback((id: string | null) => {
    if (activeIdRef.current === id) return
    activeIdRef.current = id
    listenersRef.current.forEach((cb) => cb())
  }, [])

  const subscribeActiveItem = useCallback((cb: () => void) => {
    listenersRef.current.add(cb)
    return () => {
      listenersRef.current.delete(cb)
    }
  }, [])

  const getActiveItemId = useCallback(() => activeIdRef.current, [])

  useEffect(() => {
    if (!editor || items.length === 0) {
      setActive(null)
      return
    }
    const root = scrollContainerRef.current ?? undefined

    // Map DOM node -> TOC id so the observer callback can resolve targets.
    const nodeToId = new Map<Element, string>()
    items.forEach((item) => {
      const dom = editor.view.nodeDOM(item.pos)
      if (dom && dom instanceof Element) nodeToId.set(dom, item.id)
    })

    if (nodeToId.size === 0) {
      setActive(null)
      return
    }

    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = nodeToId.get(entry.target)
          if (!id) continue
          if (entry.isIntersecting) visible.add(id)
          else visible.delete(id)
        }
        // Pick the visible item that appears earliest in document order.
        let firstVisible: string | null = null
        for (const item of items) {
          if (visible.has(item.id)) {
            firstVisible = item.id
            break
          }
        }
        if (firstVisible !== null) setActive(firstVisible)
      },
      { root, rootMargin: '-20% 0px -70% 0px', threshold: 0 },
    )

    nodeToId.forEach((_id, node) => observer.observe(node))

    return () => observer.disconnect()
  }, [items, editor, scrollContainerRef, setActive])

  return { getActiveItemId, subscribeActiveItem }
}
