import type { Node } from '@tiptap/pm/model'
import { GitBranch } from 'lucide-react'

import { getLangIcon } from '@/components/Library/ChapterTocPanel/ChapterTocPanel.utils'

import type { NotesTocPositionedItem } from '../NotesTocProvider.types'
import { getLangDisplayName } from './getLangDisplayName'

/**
 * Maps a Tiptap `codeBlock` node to a TOC entry. Mermaid blocks get a
 * dedicated icon/badge; plain/text/empty-language blocks are skipped so the
 * TOC stays focused on meaningful snippets.
 */
export function codeBlockNodeToTocItem(
  node: Node,
  pos: number,
  index: number,
): NotesTocPositionedItem | null {
  const rawLang = (node.attrs.language as string | undefined) ?? ''
  const lang = rawLang.toLowerCase().trim()

  if (lang === 'mermaid') {
    return {
      id: `notes-toc-mermaid-${index}`,
      pos,
      type: 'mermaid',
      label: 'Mermaid Diagram',
      level: 'tertiary',
      icon: GitBranch,
      iconColor: 'text-violet-400',
      badge: 'mermaid',
    }
  }

  if (!lang || lang === 'text') return null

  const entry = getLangIcon(lang)
  return {
    id: `notes-toc-code-${index}`,
    pos,
    type: 'code',
    label: getLangDisplayName(lang),
    level: 'tertiary',
    icon: entry.icon,
    iconColor: entry.color,
    badge: lang,
  }
}
