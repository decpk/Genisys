import { useMemo } from 'react'
import { AlignLeft, GitBranch, Hash, Lightbulb } from 'lucide-react'

import { useChapterToc, useActiveHighlightId } from '../ChapterTocContext'
import type { ChapterHighlight } from '../chapter-highlights'
import { TocPanelDataProvider } from '@/right-panels/TocPanel'
import type { TocItem, TocPanelData, TocPanelActions } from '@/right-panels/TocPanel'
import { useBookmarkStore } from '@/store/bookmark-store'

import { getLangIcon } from './ChapterTocPanel.utils'

function getLevel(h: ChapterHighlight): TocItem['level'] {
  if (h.type === 'section' && (!h.depth || h.depth === 2)) return 'primary'
  if (h.type === 'section' && h.depth !== undefined && h.depth >= 3) return 'secondary'
  return 'tertiary'
}

function getIcon(h: ChapterHighlight): { icon: TocItem['icon']; iconColor: string } {
  if (h.type === 'code') {
    const entry = getLangIcon(h.lang)
    return { icon: entry.icon, iconColor: entry.color }
  }
  if (h.type === 'mermaid') return { icon: GitBranch, iconColor: 'text-violet-400' }
  if (h.type === 'important') return { icon: Lightbulb, iconColor: 'text-amber-400' }
  if (h.depth && h.depth >= 3) return { icon: Hash, iconColor: 'text-muted-foreground/60' }
  return { icon: AlignLeft, iconColor: 'text-foreground/60' }
}

function highlightToTocItem(h: ChapterHighlight, isBookmarked: boolean): TocItem {
  const { icon, iconColor } = getIcon(h)
  return {
    id: h.id,
    label: h.label,
    level: getLevel(h),
    icon,
    iconColor,
    badge: h.type === 'code' && h.lang ? h.lang : undefined,
    isBookmarked,
  }
}

export function LibraryTocPanelWrapper(props: { children: React.ReactNode }): React.JSX.Element {
  const { children } = props
  const { highlights, scrollToHighlight } = useChapterToc()
  const activeHighlightId = useActiveHighlightId()
  const chapterBookmarkIds = useBookmarkStore((s) => s.chapterBookmarkIds)

  const data: TocPanelData = useMemo(
    () => ({
      items: highlights.map((h) => highlightToTocItem(h, chapterBookmarkIds.has(h.id))),
      activeItemId: activeHighlightId,
    }),
    [highlights, activeHighlightId, chapterBookmarkIds],
  )

  const actions: TocPanelActions = useMemo(
    () => ({ onNavigate: scrollToHighlight }),
    [scrollToHighlight],
  )

  return (
    <TocPanelDataProvider data={data} actions={actions}>
      {children}
    </TocPanelDataProvider>
  )
}
