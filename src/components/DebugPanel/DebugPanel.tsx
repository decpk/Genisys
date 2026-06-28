import { Suspense } from 'react'

import { AppLoader } from '@/components/AppLoader'

import { DebugTabsBar } from './components/DebugTabsBar'
import { useDebugPanelData } from './useDebugPanelData'
import type { DebugPanelProps } from './DebugPanel.types'

export function DebugPanel(props: DebugPanelProps): React.JSX.Element {
  const { defaultTab } = props
  const { visibleTabs, effectiveTab, activeConfig, handleTabChange } = useDebugPanelData({
    defaultTab,
  })
  const TabContent = activeConfig.Component

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 border-b border-border/40 bg-card">
        <DebugTabsBar tabs={visibleTabs} activeTab={effectiveTab} onTabChange={handleTabChange} />
      </div>

      <div className="flex-1 min-h-0">
        <Suspense fallback={<AppLoader />}>
          <TabContent />
        </Suspense>
      </div>
    </div>
  )
}
