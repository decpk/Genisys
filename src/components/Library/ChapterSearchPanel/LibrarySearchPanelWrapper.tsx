import { useMemo } from 'react'

import { useChapterSearch } from '../ChapterSearchContext'
import { SearchPanelDataProvider } from '@/right-panels/SearchPanel'
import type { SearchPanelData, SearchPanelActions, SearchPanelMatch } from '@/right-panels/SearchPanel'

export function LibrarySearchPanelWrapper(props: { children: React.ReactNode }): React.JSX.Element {
  const { children } = props
  const {
    searchQuery,
    currentMatchIndex,
    totalMatches,
    matches,
    setSearchQuery,
    navigateMatch,
    scrollToMatch,
    clearSearch,
    registerFocusCallback,
  } = useChapterSearch()

  const data: SearchPanelData = useMemo(
    () => ({
      searchQuery,
      currentMatchIndex,
      totalMatches,
      matches: matches.map((m): SearchPanelMatch => ({
        id: String(m.index),
        index: m.index,
        text: m.text,
        surroundingText: m.surroundingText,
      })),
    }),
    [searchQuery, currentMatchIndex, totalMatches, matches],
  )

  const actions: SearchPanelActions = useMemo(
    () => ({ setSearchQuery, navigateMatch, scrollToMatch, clearSearch, registerFocusCallback }),
    [setSearchQuery, navigateMatch, scrollToMatch, clearSearch, registerFocusCallback],
  )

  return (
    <SearchPanelDataProvider data={data} actions={actions}>
      {children}
    </SearchPanelDataProvider>
  )
}
