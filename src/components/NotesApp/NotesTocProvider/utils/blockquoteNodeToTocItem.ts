import type { Node } from '@tiptap/pm/model'
import { Lightbulb } from 'lucide-react'

import type { NotesTocPositionedItem } from '../NotesTocProvider.types'
import { getNodeText } from './getNodeText'
import { isImportantBlockquote } from './isImportantBlockquote'

export function blockquoteNodeToTocItem(
  node: Node,
  pos: number,
  index: number,
  prevItem: NotesTocPositionedItem | null,
): NotesTocPositionedItem | null {
  const text = getNodeText(node).trim()
  if (!isImportantBlockquote(text, prevItem)) return null

  return {
    id: `notes-toc-important-${index}`,
    pos,
    type: 'important',
    label: text,
    level: 'tertiary',
    icon: Lightbulb,
    iconColor: 'text-amber-400',
  }
}
