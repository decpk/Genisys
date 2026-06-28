import { useCallback, useEffect, useRef } from 'react'
import { Activity, ArrowDownUp, ChevronDown, MousePointerClick, Search, Trash2 } from 'lucide-react'
import { useVirtualizer } from '@tanstack/react-virtual'

import { ResizablePanel } from '@/components/ResizablePanel'
import { SidebarLayout } from '@/components/ui/sidebar-layout'
import { SIDE_PANEL_SURFACE_CLASS } from '@/lib/panel-classes'
import { SectionHeader } from '@/components/ui/section-header'
import { Switch } from '@/components/ui/switch'
import { IconButton } from '@/components/ui/icon-button'
import { Badge } from '@/components/ui/badge'
import { useSettingsStore } from '@/store/settings-store'

import { AI_STATUS_FILTERS, ORIGIN_APPS } from './AIInspector.constants'
import { AIRequestRow } from './components/AIRequestRow'
import { AIRequestDetail } from './components/AIRequestDetail'
import { AIInspectorStats } from './components/AIInspectorStats'
import { useAIInspectorData } from './hooks/useAIInspectorData'

import type { AISortField } from './AIInspector.types'

export function AIInspector(): React.JSX.Element {
  const {
    filteredRequests,
    selectedRequest,
    statusFilter,
    searchQuery,
    originFilter,
    selectedId,
    isIntercepting,
    stats,
    sortField,
    sortDirection,
    setStatusFilter,
    setSearchQuery,
    setOriginFilter,
    selectRequest,
    navigateRequest,
    handleClear,
    toggleIntercepting,
    setSortField,
    setSortDirection,
  } = useAIInspectorData()

  const sidebarPosition = useSettingsStore((s) => s.sidebarPosition)
  const hasRequests = filteredRequests.length > 0
  const interceptLabel = isIntercepting ? 'Intercepting' : 'Not active'

  const parentRef = useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: filteredRequests.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 5,
  })

  useEffect(() => {
    if (!selectedId) return
    const index = filteredRequests.findIndex((r) => r.id === selectedId)
    if (index !== -1) {
      rowVirtualizer.scrollToIndex(index, { align: 'auto' })
    }
  }, [selectedId, filteredRequests, rowVirtualizer])

  const handleListKeyDown = useCallback((e: React.KeyboardEvent): void => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      navigateRequest('down')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      navigateRequest('up')
    }
  }, [navigateRequest])

  const handleSortToggle = useCallback(() => {
    const fields: AISortField[] = ['time', 'duration', 'channel']
    const currentIdx = fields.indexOf(sortField)
    const nextIdx = (currentIdx + 1) % fields.length
    setSortField(fields[nextIdx])
  }, [sortField, setSortField])

  const handleSortDirectionToggle = useCallback(() => {
    setSortDirection((prev) => prev === 'asc' ? 'desc' : 'asc')
  }, [setSortDirection])

  const requestListContent = hasRequests ? (
    <div
      ref={parentRef}
      className="flex-1 overflow-y-auto outline-none"
      tabIndex={0}
      onKeyDown={handleListKeyDown}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const request = filteredRequests[virtualRow.index]
          return (
            <div
              key={request.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
              ref={rowVirtualizer.measureElement}
              data-index={virtualRow.index}
            >
              <AIRequestRow
                request={request}
                isSelected={selectedId === request.id}
                onSelect={selectRequest}
              />
            </div>
          )
        })}
      </div>
    </div>
  ) : (
    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground select-none px-4">
      <Activity size={18} className="text-muted-foreground/40" />
      <span className="text-xs text-center text-muted-foreground/60">
        {isIntercepting ? 'Waiting for AI requests...' : 'Enable intercepting to capture AI requests'}
      </span>
    </div>
  )

  const sidebar = (
    <ResizablePanel
      as="aside"
      defaultWidth={380}
      minWidth={300}
      maxWidth={600}
      position={sidebarPosition}
      className={SIDE_PANEL_SURFACE_CLASS}
      expandTitle="Expand request list"
      collapseTitle="Collapse request list"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="shrink-0 border-b border-border/40 px-3 py-2.5 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <SectionHeader icon={Activity} title="AI Inspector" />
              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-primary/10 text-primary border-primary/30">
                DEV
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1.5 text-[10px] mr-1">
                <Switch
                  checked={isIntercepting}
                  onCheckedChange={toggleIntercepting}
                />
                <span className="text-muted-foreground">{interceptLabel}</span>
              </div>
              <IconButton
                tooltip="Clear all requests"
                onClick={handleClear}
                size="sm"
              >
                <Trash2 size={14} />
              </IconButton>
            </div>
          </div>

          <AIInspectorStats stats={stats} />

          {/* Search */}
          <div className="relative">
            <Search
              size={12}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search channels, models, messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-2 py-1.5 text-[11px] bg-secondary/40 border border-transparent rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-input focus:ring-1 focus:ring-ring/20"
            />
          </div>

          {/* Status filters */}
          <div className="flex items-center flex-wrap gap-0.5">
            {AI_STATUS_FILTERS.map(({ value, label }) => {
              const isActive = statusFilter === value
              const btnClass = isActive
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              return (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={`text-[10px] px-2 py-0.5 rounded transition-colors ${btnClass}`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {/* Origin filter + Sort */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <select
                value={originFilter}
                onChange={(e) => setOriginFilter(e.target.value)}
                className="w-full text-[11px] pl-2 pr-6 py-1 bg-secondary/40 border border-transparent rounded-md text-foreground appearance-none cursor-pointer focus:outline-none focus:border-input focus:ring-1 focus:ring-ring/20"
              >
                {ORIGIN_APPS.map((app) => (
                  <option key={app} value={app}>{app === 'All' ? 'All Origins' : app}</option>
                ))}
              </select>
              <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            <button
              onClick={handleSortToggle}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-secondary transition-colors"
              title={`Sort by: ${sortField}`}
            >
              <ArrowDownUp size={10} />
              {sortField}
            </button>
            <button
              onClick={handleSortDirectionToggle}
              className="text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-1 rounded hover:bg-secondary transition-colors"
              title={`Direction: ${sortDirection}`}
            >
              {sortDirection === 'desc' ? '↓' : '↑'}
            </button>
          </div>
        </div>

        {/* Request list */}
        {requestListContent}
      </div>
    </ResizablePanel>
  )

  const detailView = selectedRequest ? (
    <AIRequestDetail request={selectedRequest} />
  ) : (
    <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground select-none">
      <MousePointerClick size={24} className="text-muted-foreground/30" />
      <div className="text-center">
        <p className="text-xs">Select a request to inspect</p>
        <p className="text-[10px] text-muted-foreground/50 mt-1">Use ↑↓ keys to navigate</p>
      </div>
    </div>
  )

  return (
    <SidebarLayout sidebarPosition={sidebarPosition} sidebar={sidebar}>
      {detailView}
    </SidebarLayout>
  )
}
