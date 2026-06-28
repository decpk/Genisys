import type { DebugTab, DebugTabConfig } from '../../DebugPanel.types'

export interface DebugTabsBarProps {
  tabs: ReadonlyArray<DebugTabConfig>
  activeTab: DebugTab
  onTabChange: (value: string) => void
}
