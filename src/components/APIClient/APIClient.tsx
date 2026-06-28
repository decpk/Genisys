import { useCallback, useEffect, useRef, useState } from 'react'
import { Sparkles, StickyNote } from 'lucide-react'

import { AppShell } from '@/components/AppShell/AppShell'
import { AppLoader } from '@/components/AppLoader/AppLoader'
import { RightPanel } from '@/components/RightPanel'
import { RightPanelTabs } from '@/frameworks/right-panel'
import type { PanelDef } from '@/frameworks/right-panel'
import { AIAssistantPanel } from '@/right-panels/AIAssistantPanel'
import { NotesPanel } from '@/right-panels/Notes'
import { useApiClientStore } from '@/store/api-client-store'

import { APIClientSidebar } from './components/APIClientSidebar'
import { APIClientAIAssistantWrapper } from './components/APIClientAIAssistantWrapper'
import { APIClientNotesWrapper } from './components/APIClientNotesWrapper'
import { APIClientTabBar } from './components/APIClientTabBar'
import { RequestBuilder } from './components/RequestBuilder'
import { ResponseViewer } from './components/ResponseViewer'
import { useAPIClientData } from './hooks/useAPIClientData'
import { useReportAPIClientBusy } from './hooks/useReportAPIClientBusy'

const APICLIENT_PANELS: PanelDef[] = [
  {
    id: 'ai-assistant',
    label: 'AI Assistant',
    icon: Sparkles,
    component: AIAssistantPanel,
    wrapper: APIClientAIAssistantWrapper,
    defaultTab: true,
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: StickyNote,
    component: NotesPanel,
    wrapper: APIClientNotesWrapper,
  },
]

const DEFAULT_RESPONSE_HEIGHT = 240
const MIN_RESPONSE_HEIGHT = 120
const COLLAPSE_THRESHOLD = 60

export function APIClient(): React.JSX.Element {
  const { isLoading, isLoaded } = useAPIClientData()
  useReportAPIClientBusy()
  const openRequestTabs = useApiClientStore((s) => s.openRequestTabs)
  const activeRequestTabId = useApiClientStore((s) => s.activeRequestTabId)
  const activeResponse = useApiClientStore((s) => s.activeResponse)
  const isSending = useApiClientStore((s) => s.isSending)
  const hasResponse = isSending || activeResponse !== null
  const hasTabs = openRequestTabs.length > 0

  const containerRef = useRef<HTMLDivElement>(null)
  const [responseHeight, setResponseHeight] = useState(DEFAULT_RESPONSE_HEIGHT)
  const [collapsed, setCollapsed] = useState(false)
  const lastHeight = useRef(0)
  const rafId = useRef(0)
  const prevActiveResponse = useRef(activeResponse)
  const prevIsSending = useRef(isSending)
  const containerHeightRef = useRef(600)
  const initialised = useRef(false)

  const getMaxResponseHeight = useCallback(() => {
    const el = containerRef.current
    if (el) containerHeightRef.current = el.clientHeight
    return containerHeightRef.current - MIN_RESPONSE_HEIGHT
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      containerHeightRef.current = entry.contentRect.height
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Set initial 50% height once the container is measured
  useEffect(() => {
    if (initialised.current) return
    const el = containerRef.current
    if (!el) return
    const h = Math.floor(el.clientHeight / 2)
    if (h > MIN_RESPONSE_HEIGHT) {
      initialised.current = true
      setResponseHeight(h)
    }
  })

  // Auto-expand when sending starts or a new response arrives; auto-collapse when cleared
  useEffect(() => {
    if (
      (isSending && !prevIsSending.current) ||
      (activeResponse && !prevActiveResponse.current)
    ) {
      setCollapsed(false)
      const h = lastHeight.current || Math.floor(containerHeightRef.current / 2)
      setResponseHeight(h)
    }

    prevActiveResponse.current = activeResponse
    prevIsSending.current = isSending
  }, [isSending, activeResponse, hasResponse])

  // Drag handle for resizing the response panel
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      const startY = e.clientY
      const startHeight = responseHeight
      const maxH = getMaxResponseHeight()
      let collapsedDuringDrag = false

      const onMouseMove = (moveEvent: MouseEvent): void => {
        cancelAnimationFrame(rafId.current)
        rafId.current = requestAnimationFrame(() => {
          const delta = startY - moveEvent.clientY
          const rawHeight = startHeight + delta

          if (!collapsedDuringDrag && rawHeight < COLLAPSE_THRESHOLD) {
            collapsedDuringDrag = true
            lastHeight.current = responseHeight
            setCollapsed(true)
            return
          }
          if (collapsedDuringDrag && rawHeight >= COLLAPSE_THRESHOLD) {
            collapsedDuringDrag = false
            const clamped = Math.min(maxH, Math.max(MIN_RESPONSE_HEIGHT, rawHeight))
            setResponseHeight(clamped)
            lastHeight.current = clamped
            setCollapsed(false)
            return
          }
          if (collapsedDuringDrag) return

          const newHeight = Math.min(maxH, Math.max(MIN_RESPONSE_HEIGHT, rawHeight))
          setResponseHeight(newHeight)
          lastHeight.current = newHeight
        })
      }

      const onMouseUp = (): void => {
        cancelAnimationFrame(rafId.current)
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.body.style.cursor = 'row-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [responseHeight, getMaxResponseHeight],
  )

  // Drag-to-expand from collapsed strip (vertical adaptation of ResizablePanel pattern)
  const handleExpandMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      const startY = e.clientY
      const maxH = getMaxResponseHeight()
      let dragHeight = 0
      let expanded = false

      const onMouseMove = (moveEvent: MouseEvent): void => {
        cancelAnimationFrame(rafId.current)
        rafId.current = requestAnimationFrame(() => {
          dragHeight = startY - moveEvent.clientY
          if (!expanded && dragHeight >= COLLAPSE_THRESHOLD) {
            expanded = true
            const h = Math.min(maxH, Math.max(MIN_RESPONSE_HEIGHT, dragHeight))
            setResponseHeight(h)
            lastHeight.current = h
            setCollapsed(false)
          }
          if (expanded) {
            const h = Math.min(maxH, Math.max(MIN_RESPONSE_HEIGHT, dragHeight))
            setResponseHeight(h)
            lastHeight.current = h
          }
        })
      }

      const onMouseUp = (): void => {
        cancelAnimationFrame(rafId.current)
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.body.style.cursor = 'row-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [getMaxResponseHeight],
  )

  const toggleCollapse = useCallback(() => {
    if (collapsed) {
      setCollapsed(false)
      const h = lastHeight.current || Math.floor(containerHeightRef.current / 2)
      setResponseHeight(h)
    } else {
      lastHeight.current = responseHeight
      setCollapsed(true)
    }
  }, [collapsed, responseHeight])

  if (isLoading || !isLoaded) {
    return <AppLoader />
  }

  const showCollapsedStrip = collapsed
  const showResponsePane = !collapsed

  return (
    <AppShell
      appId="apiclient"
      sidebar={<APIClientSidebar />}
      sidebarWidth={280}
      sidebarMinWidth={220}
      sidebarMaxWidth={400}
      rightPanel={
        <RightPanel
          appId="apiclient-ai"
          defaultWidth={400}
          minWidth={260}
          maxWidth={600}
          defaultOpen
        >
          <RightPanelTabs panels={APICLIENT_PANELS} />
        </RightPanel>
      }
    >
      <div ref={containerRef} className="flex flex-col h-full">
        {/* Request tabs — only shown when at least one request is open */}
        {hasTabs && <APIClientTabBar />}

        {/* Request Builder — fills remaining space */}
        <div key={activeRequestTabId ?? 'empty'} className="flex-1 min-h-[100px] overflow-hidden">
          <RequestBuilder />
        </div>

        {showCollapsedStrip && (
          <div className="relative shrink-0 h-[6px] group/strip">
            <div
              className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[12px] z-20 cursor-row-resize flex items-center justify-center"
              onMouseDown={handleExpandMouseDown}
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapse();
              }}
            >
              {/* Grip dots */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover/strip:opacity-100 transition-opacity">
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              </div>
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-primary/30 opacity-0 group-hover/strip:opacity-100 transition-opacity pointer-events-none" />
            </div>
          </div>
        )}

        {showResponsePane && (
          <>
            {/* Drag handle with grip indicator */}
            <div
              onMouseDown={handleMouseDown}
              className="shrink-0 h-[6px] cursor-row-resize border-y border-border/20 bg-primary/5 hover:bg-primary/10 active:bg-primary/15 transition-colors flex items-center justify-center group/drag"
            >
              <div className="flex items-center gap-0.5 opacity-0 group-hover/drag:opacity-100 transition-opacity">
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              </div>
            </div>
            {/* Response Viewer — fixed height, collapsible */}
            <div
              className="shrink-0 overflow-hidden"
              style={{ height: responseHeight }}
            >
              <ResponseViewer />
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
