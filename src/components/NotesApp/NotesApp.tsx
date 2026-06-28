import { useEffect, useRef } from 'react'
import { Highlighter, Link2, List, Network, Sparkles } from 'lucide-react'

import { AppShell } from '@/components/AppShell'
import { AppShellLoader } from '@/components/AppLoader'
import { RightPanel } from '@/components/RightPanel'
import { RightPanelTabs } from '@/frameworks/right-panel'
import type { PanelDef } from '@/frameworks/right-panel'
import { AIAssistantPanel } from '@/right-panels/AIAssistantPanel'
import { TocPanel } from '@/right-panels/TocPanel'
import { useNotesAppStore } from '@/store/notes-app-store'
import { toggleActiveSidebar } from '@/store/panel-toggle-registry'

import { NotesHighlightsPanel } from './NotesHighlightsPanel'
import { useNotesHighlightsIndicator } from './NotesHighlightsPanel/useNotesHighlightsIndicator'
import {
  NotesBacklinksPanel,
  useNotesBacklinksIndicator,
} from './NotesBacklinksPanel'
import { NotesGraphPanel } from './NotesGraphPanel'
import { NotesSidebar } from './components/NotesSidebar'
import { NotesMainContent } from './components/NotesMainContent'
import { NotesAIAssistantWrapper } from './NotesAIAssistantWrapper'
import { NotesTocPanelWrapper } from './NotesTocPanel'
import { NotesTocProvider } from './NotesTocProvider'
import { useNotesAppData } from './useNotesAppData'

const NOTES_PANELS: PanelDef[] = [
  {
    id: 'toc',
    label: 'On this page',
    icon: List,
    component: TocPanel,
    wrapper: NotesTocPanelWrapper,
    defaultTab: true,
  },
  {
    id: 'highlights',
    label: 'Highlights',
    icon: Highlighter,
    component: NotesHighlightsPanel,
    useIndicator: useNotesHighlightsIndicator,
  },
  {
    id: 'backlinks',
    label: 'Backlinks',
    icon: Link2,
    component: NotesBacklinksPanel,
    useIndicator: useNotesBacklinksIndicator,
  },
  {
    id: 'graph',
    label: 'Graph',
    icon: Network,
    component: NotesGraphPanel,
  },
  {
    id: 'ai-assistant',
    label: 'AI Assistant',
    icon: Sparkles,
    component: AIAssistantPanel,
    wrapper: NotesAIAssistantWrapper,
  },
]

export function NotesApp(): React.JSX.Element {
  const { isLoaded, rightPanelOpen, setRightPanelOpen, activeTab, handleTabChange } = useNotesAppData()
  const selectedNoteId = useNotesAppStore((s) => s.selectedNoteId)
  const distractionFree = useNotesAppStore((s) => s.distractionFree)
  const setDistractionFree = useNotesAppStore((s) => s.setDistractionFree)

  // Track pre-distraction-free panel states for restore
  const preDFState = useRef<{ rightPanelWasOpen: boolean } | null>(null)

  // Distraction-free mode: collapse/restore panels
  useEffect(() => {
    if (distractionFree) {
      preDFState.current = { rightPanelWasOpen: rightPanelOpen }
      toggleActiveSidebar()
      setRightPanelOpen(false)
    } else if (preDFState.current) {
      toggleActiveSidebar()
      setRightPanelOpen(preDFState.current.rightPanelWasOpen)
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

  if (!isLoaded) return <AppShellLoader />

  return (
    <NotesTocProvider>
      <AppShell
        appId="notes"
        sidebar={<NotesSidebar />}
        rightPanel={
          <RightPanel
            appId="notes-panel"
            defaultWidth={340}
            minWidth={260}
            maxWidth={700}
            forceCollapsed={!selectedNoteId}
            open={rightPanelOpen}
            onOpenChange={setRightPanelOpen}
            defaultOpen
          >
            <RightPanelTabs
              panels={NOTES_PANELS}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </RightPanel>
        }
      >
        <NotesMainContent />
      </AppShell>
    </NotesTocProvider>
  );
}
