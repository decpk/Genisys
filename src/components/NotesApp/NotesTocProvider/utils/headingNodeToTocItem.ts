import type { Node } from '@tiptap/pm/model'
import { AlignLeft, Hash } from 'lucide-react'

import { slugify } from '@/components/Library/chapter-highlights'

import type { NotesTocPositionedItem } from '../NotesTocProvider.types'
import { getNodeText } from './getNodeText'
import { makeUniqueTocId } from './makeUniqueTocId'

/**
 * Builds a `NotesTocPositionedItem` for an H2/H3 heading. Returns `null` for
 * H1 (typically the note title) and for any heading deeper than H3 so the
 * outline stays scannable.
 */
export function headingNodeToTocItem(
  node: Node,
  pos: number,
  seen: Map<string, number>,
): NotesTocPositionedItem | null {
  const depth = (node.attrs.level as number | undefined) ?? 0
  if (depth < 2 || depth > 3) return null

  const text = getNodeText(node).trim()
  if (!text) return null

  const slug = slugify(text)
  const id = makeUniqueTocId('notes-toc-section', slug || 'section', seen)

  const isPrimary = depth === 2

  let level: NotesTocPositionedItem['level']
  if (isPrimary) level = 'primary'
  else level = 'secondary'

  let icon: NotesTocPositionedItem['icon']
  let iconColor: string
  if (isPrimary) {
    icon = AlignLeft
    iconColor = 'text-foreground/60'
  } else {
    icon = Hash
    iconColor = 'text-muted-foreground/60'
  }

  return {
    id,
    pos,
    type: 'section',
    label: text,
    level,
    icon,
    iconColor,
  }
}
