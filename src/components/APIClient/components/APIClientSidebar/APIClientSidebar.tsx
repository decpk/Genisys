import { Globe, Clock, Layers } from 'lucide-react'
import { LeftPanel } from '@/LeftPanel'
import type { PanelDef } from '@/LeftPanel'
import { useApiClientStore } from '@/store/api-client-store'
import { CollectionsPanel } from './panels/CollectionsPanel'
import { HistoryPanel } from '../HistoryPanel/HistoryPanel'
import { EnvironmentManager } from '../EnvironmentManager/EnvironmentManager'

const API_CLIENT_SIDEBAR_PANELS: PanelDef[] = [
  {
    id: 'collections',
    label: 'Collections',
    icon: Layers,
    component: CollectionsPanel,
    defaultTab: true,
  },
  {
    id: 'history',
    label: 'History',
    icon: Clock,
    component: HistoryPanel,
  },
  {
    id: 'environments',
    label: 'Envs',
    icon: Globe,
    component: EnvironmentManager,
  },
]

export function APIClientSidebar(): React.JSX.Element {
  const sidebarTab = useApiClientStore((s) => s.sidebarTab)
  const setSidebarTab = useApiClientStore((s) => s.setSidebarTab)

  return (
    <LeftPanel
      panels={API_CLIENT_SIDEBAR_PANELS}
      activeTab={sidebarTab}
      onTabChange={(tab) => setSidebarTab(tab as typeof sidebarTab)}
      instanceId="apiclient-sidebar"
    />
  )
}
