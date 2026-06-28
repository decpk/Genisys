import type { Editor } from '@tiptap/react'

const SCROLL_OFFSET = 16

/**
 * Smooth-scrolls `container` so that the editor coordinate at `pos` sits
 * near the top (offset by `SCROLL_OFFSET`px for breathing room). Falls back
 * to `scrollIntoView` on the resolved DOM node if `coordsAtPos` throws —
 * which can happen if the position has just been removed.
 */
export function scrollEditorToPos(editor: Editor, pos: number, container: HTMLDivElement): void {
  if (editor.isDestroyed) return
  try {
    const coords = editor.view.coordsAtPos(pos)
    const containerRect = container.getBoundingClientRect()
    const target = coords.top - containerRect.top + container.scrollTop - SCROLL_OFFSET
    container.scrollTo({ top: Math.max(0, target), behavior: 'smooth' })
  } catch {
    const dom = editor.view.nodeDOM(pos)
    if (dom && dom instanceof Element) {
      dom.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}
