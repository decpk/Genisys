import { useCallback, useEffect, useRef, useState } from 'react'
import { List, Search, Sparkles } from 'lucide-react'

import { AppShell } from '@/components/AppShell'
import { RightPanel } from '@/components/RightPanel'
import { RightPanelTabs } from '@/frameworks/right-panel'
import type { PanelDef } from '@/frameworks/right-panel'
import { useLibraryStore } from '@/store/library-store'
import { useSettingsStore } from '@/store/settings-store'
import { useNavigationStore } from '@/store/navigation-store'
import { toggleActiveSidebar } from '@/store/panel-toggle-registry'

import { TocPanel } from '@/right-panels/TocPanel'
import { SearchPanel } from '@/right-panels/SearchPanel'
import { AIAssistantPanel } from '@/right-panels/AIAssistantPanel'

import { LibrarySidebar } from './LibrarySidebar'
import { LibraryContent } from './LibraryContent'
import { BookGeneratorProvider } from './BookGeneratorContext'
import { ChapterTocProvider } from './ChapterTocContext'
import { LibraryTocPanelWrapper } from './ChapterTocPanel'
import { ChapterSearchProvider, useChapterSearch } from './ChapterSearchContext'
import { LibrarySearchPanelWrapper } from './ChapterSearchPanel'
import { LibraryAIAssistantWrapper } from './LibraryAIAssistantWrapper'
import { LibraryAIContextProvider } from './LibraryAIContext'
import { useReportLibraryBusy } from './hooks/useReportLibraryBusy'

const LIBRARY_PANELS: PanelDef[] = [
  { id: 'toc', label: 'On this page', icon: List, component: TocPanel, wrapper: LibraryTocPanelWrapper, defaultTab: true },
  { id: 'search', label: 'Search', icon: Search, component: SearchPanel, wrapper: LibrarySearchPanelWrapper },
  { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles, component: AIAssistantPanel, wrapper: LibraryAIAssistantWrapper },
]

function LibraryInner(): React.JSX.Element {
  // Protect Library from keep-alive LRU eviction while a book/chapter/
  // translation is generating (reads the live phase from BookGeneratorContext).
  useReportLibraryBusy()

  const isLoaded = useLibraryStore((s) => s.isLoaded)
  const loadBooks = useLibraryStore((s) => s.loadBooks)
  const activeChapterId = useLibraryStore((s) => s.activeChapterId)
  const selectBook = useLibraryStore((s) => s.selectBook)
  const distractionFree = useLibraryStore((s) => s.distractionFree)
  const setDistractionFree = useLibraryStore((s) => s.setDistractionFree)
  const dfHideSidebar = useSettingsStore((s) => s.libraryDFHideSidebar)
  const dfHideRightPanel = useSettingsStore((s) => s.libraryDFHideRightPanel)
  const { activateSearch } = useChapterSearch()

  const pendingLibraryBookId = useNavigationStore((s) => s.pendingLibraryBookId)
  const consumeLibraryBook = useNavigationStore((s) => s.consumeLibraryBook)

  const [activeTab, setActiveTab] = useState('toc')
  const [rightPanelOpen, setRightPanelOpen] = useState(true)

  // Track pre-DF panel states for restore
  const preDFState = useRef<{ sidebarWasOpen: boolean; rightPanelWasOpen: boolean } | null>(null)

  useEffect(() => {
    if (!isLoaded) loadBooks()
  }, [isLoaded, loadBooks])

  useEffect(() => {
    if (!pendingLibraryBookId) return
    selectBook(pendingLibraryBookId)
    consumeLibraryBook()
  }, [pendingLibraryBookId, consumeLibraryBook, selectBook])

  // Cmd+F / Ctrl+F → switch to search tab and focus input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'f') {
        e.preventDefault()
        setRightPanelOpen(true)
        setActiveTab('search')
        // Delay to let tab switch render, then focus input
        requestAnimationFrame(() => {
          activateSearch()
        })
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activateSearch])

  // Distraction-free mode: collapse/restore panels
  useEffect(() => {
    if (distractionFree) {
      // Save current state before collapsing
      preDFState.current = {
        sidebarWasOpen: true, // AppShell default
        rightPanelWasOpen: rightPanelOpen,
      }
      if (dfHideSidebar) toggleActiveSidebar()
      if (dfHideRightPanel) setRightPanelOpen(false)
    } else if (preDFState.current) {
      // Restore
      if (dfHideSidebar && preDFState.current.sidebarWasOpen) toggleActiveSidebar()
      if (dfHideRightPanel) setRightPanelOpen(preDFState.current.rightPanelWasOpen)
      preDFState.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [distractionFree])

  // ESC exits distraction-free mode
  useEffect(() => {
    if (!distractionFree) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setDistractionFree(false)
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [distractionFree, setDistractionFree])

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId)
  }, [])

  return (
    <AppShell
      appId="library"
      sidebar={<LibrarySidebar />}
      rightPanel={
        <RightPanel
          appId="library-toc"
          defaultWidth={300}
          minWidth={300}
          maxWidth={600}
          forceCollapsed={!activeChapterId}
          open={rightPanelOpen}
          onOpenChange={setRightPanelOpen}
          defaultOpen
        >
          <RightPanelTabs
            panels={LIBRARY_PANELS}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </RightPanel>
      }
    >
      <LibraryContent />
    </AppShell>
  );
}

export function Library(): React.JSX.Element {
  return (
    <BookGeneratorProvider>
      <ChapterTocProvider>
        <ChapterSearchProvider>
          <LibraryAIContextProvider>
            <LibraryInner />
          </LibraryAIContextProvider>
        </ChapterSearchProvider>
      </ChapterTocProvider>
    </BookGeneratorProvider>
  )
}
