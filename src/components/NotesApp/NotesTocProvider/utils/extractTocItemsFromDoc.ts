import type { Node } from '@tiptap/pm/model'

import type { NotesTocPositionedItem } from '../NotesTocProvider.types'
import { headingNodeToTocItem } from './headingNodeToTocItem'
import { codeBlockNodeToTocItem } from './codeBlockNodeToTocItem'
import { blockquoteNodeToTocItem } from './blockquoteNodeToTocItem'

/**
 * Walks the ProseMirror doc tree and produces a flat, positioned TOC list.
 * Top-level headings (depth 2/3), code blocks, and "important" blockquotes
 * are collected; counters guarantee stable ids for non-heading items.
 */
export function extractTocItemsFromDoc(doc: Node): NotesTocPositionedItem[] {
  const items: NotesTocPositionedItem[] = []
  const seen = new Map<string, number>()
  let codeIdx = 0
  let bqIdx = 0
  let prevItem: NotesTocPositionedItem | null = null

  doc.descendants((node, pos) => {
    if (node.type.name === 'heading') {
      const next = headingNodeToTocItem(node, pos, seen)
      if (next) {
        items.push(next)
        prevItem = next
      }
      return true
    }

    if (node.type.name === 'codeBlock') {
      const next = codeBlockNodeToTocItem(node, pos, codeIdx)
      if (next) {
        items.push(next)
        prevItem = next
        codeIdx++
      }
      // Code block contents are leaf text — no need to descend.
      return false
    }

    if (node.type.name === 'blockquote') {
      const next = blockquoteNodeToTocItem(node, pos, bqIdx, prevItem)
      if (next) {
        items.push(next)
        prevItem = next
        bqIdx++
      }
      // Treat the blockquote as a single highlight; don't descend.
      return false
    }

    return true
  })

  return items
}
