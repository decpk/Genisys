import { DatabaseZap, MousePointerClick } from 'lucide-react'
import { useState } from 'react'

import { ResizablePanel } from '@/components/ResizablePanel'
import { SidebarLayout } from '@/components/ui/sidebar-layout'
import { SIDE_PANEL_SURFACE_CLASS } from '@/lib/panel-classes'
import { useSettingsStore } from '@/store/settings-store'

import { StoreSidebar } from './components/StoreSidebar/StoreSidebar'
import { StoreStatePanel } from './components/StoreStatePanel/StoreStatePanel'
import { useStoreInspector } from './hooks/useStoreInspector'

export function StoreInspector(): React.JSX.Element {
  const sidebarPosition = useSettingsStore((s) => s.sidebarPosition)
  const [actionsHeight, setActionsHeight] = useState(280)

  const {
    stores,
    selectedStore,
    selectStore,
    state,
    actions,
    updateState,
    deleteKey,
    searchQuery,
    setSearchQuery,
  } = useStoreInspector()

  const sidebar = (
    <ResizablePanel
      as="aside"
      defaultWidth={260}
      minWidth={200}
      maxWidth={400}
      position={sidebarPosition}
      className={SIDE_PANEL_SURFACE_CLASS}
      expandTitle="Expand store list"
      collapseTitle="Collapse store list"
    >
      <StoreSidebar
        stores={stores}
        selectedName={selectedStore?.name ?? null}
        onSelect={selectStore}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </ResizablePanel>
  )

  const mainContent = selectedStore ? (
    <StoreStatePanel
      storeName={selectedStore.name}
      state={state}
      actions={actions}
      onUpdate={updateState}
      onDelete={deleteKey}
      actionsHeight={actionsHeight}
      onActionsHeightChange={setActionsHeight}
    />
  ) : (
    <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground select-none">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/50 border border-border/40">
        <MousePointerClick size={22} className="text-muted-foreground/60" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-medium">No store selected</span>
        <span className="text-xs text-muted-foreground/60">
          Select a store from the sidebar to inspect its state
        </span>
      </div>
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 border-b border-border/40 bg-card px-3 h-12 flex items-center gap-2">
        <DatabaseZap size={16} className="text-primary" />
        <span className="text-sm font-medium">Store Inspector</span>
        <span className="text-[10px] text-muted-foreground bg-secondary/60 px-1.5 py-0.5 rounded">
          DEV
        </span>
      </div>

      <div className="flex-1 min-h-0">
        <SidebarLayout sidebarPosition={sidebarPosition} sidebar={sidebar}>
          {mainContent}
        </SidebarLayout>
      </div>
    </div>
  )
}
