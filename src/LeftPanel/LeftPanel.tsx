import { RightPanelTabs } from '@/frameworks/right-panel'

import type { LeftPanelProps } from './LeftPanel.types'

export function LeftPanel(props: LeftPanelProps): React.JSX.Element {
  const { panels, activeTab, onTabChange, className, wrapper, instanceId } = props

  return (
    <RightPanelTabs
      panels={panels}
      activeTab={activeTab}
      onTabChange={onTabChange}
      className={className ?? 'flex flex-col h-full'}
      wrapper={wrapper}
      instanceId={instanceId}
    />
  )
}
