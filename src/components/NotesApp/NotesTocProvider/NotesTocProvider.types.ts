import type { MutableRefObject } from 'react'
import type { Editor } from '@tiptap/react'
import type { TocItem } from '@/right-panels/TocPanel'

export type NotesTocItemType = 'section' | 'code' | 'mermaid' | 'important'

export interface NotesTocPositionedItem extends TocItem {
  pos: number
  type: NotesTocItemType
}

export interface NotesTocContextValue {
  /** The live Tiptap editor instance for the active note, or null. */
  editor: Editor | null
  registerEditor: (editor: Editor | null) => void
  registerScrollContainer: (el: HTMLDivElement | null) => void
  scrollContainerRef: MutableRefObject<HTMLDivElement | null>
  items: NotesTocPositionedItem[]
  getActiveItemId: () => string | null
  subscribeActiveItem: (cb: () => void) => () => void
  scrollToItem: (id: string) => void
}
