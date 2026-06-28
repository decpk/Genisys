import type { PanelDef, RightPanelTabsProps } from '@/frameworks/right-panel'

export interface LeftPanelProps {
  /** Array of panel definitions to render as tabs */
  panels: PanelDef[]
  /** Controlled active tab id */
  activeTab?: string
  /** Callback when active tab changes */
  onTabChange?: (tabId: string) => void
  /** Additional CSS class for the root container */
  className?: string
  /** Shared wrapper for all panels (e.g., context provider) */
  wrapper?: RightPanelTabsProps['wrapper']
  /** Unique instance identifier for this LeftPanel */
  instanceId?: string
}
