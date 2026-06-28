import { lazy } from 'react'
import { Activity, AlertCircle, Bug, Database, DatabaseZap, Lightbulb } from 'lucide-react'

import type { DebugTab, DebugTabConfig, StatusFilterOption } from './DebugPanel.types'

const ApiInspectorTab = lazy(() =>
  import('./tabs/ApiInspectorTab').then((m) => ({ default: m.ApiInspectorTab })),
)
const DbExplorer = lazy(() =>
  import('./components/DbExplorer').then((m) => ({ default: m.DbExplorer })),
)
const StoreInspectorTab = lazy(() =>
  import('@/components/StoreInspector/StoreInspector').then((m) => ({
    default: m.StoreInspector,
  })),
)
const AIInspectorTab = lazy(() =>
  import('@/components/AIInspector/AIInspector').then((m) => ({ default: m.AIInspector })),
)
const BugReportTab = lazy(() =>
  import('./tabs/BugReportTab').then((m) => ({ default: m.BugReportTab })),
)
const FeatureRequestTab = lazy(() =>
  import('@/components/FeatureRequest/FeatureRequest').then((m) => ({
    default: m.FeatureRequest,
  })),
)

export const DEBUG_TABS: ReadonlyArray<DebugTabConfig> = [
  { id: 'api', label: 'API Inspector', icon: Bug, devOnly: true, Component: ApiInspectorTab },
  { id: 'db', label: 'DB Explorer', icon: Database, devOnly: true, Component: DbExplorer },
  {
    id: 'store',
    label: 'Store Inspector',
    icon: DatabaseZap,
    devOnly: true,
    Component: StoreInspectorTab,
  },
  { id: 'ai', label: 'AI Inspector', icon: Activity, devOnly: true, Component: AIInspectorTab },
  {
    id: 'report-bug',
    label: 'Report a Bug',
    icon: AlertCircle,
    devOnly: false,
    Component: BugReportTab,
  },
  {
    id: 'request-feature',
    label: 'Request a Feature',
    icon: Lightbulb,
    devOnly: false,
    Component: FeatureRequestTab,
  },
]

export const DEV_ONLY_TABS: ReadonlyArray<DebugTab> = DEBUG_TABS.filter(
  (tab) => tab.devOnly,
).map((tab) => tab.id)

export const STATUS_FILTERS: ReadonlyArray<StatusFilterOption> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'success', label: 'Success' },
  { value: 'error', label: 'Error' }
] as const

export const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-500',
  success: 'text-green-500',
  error: 'text-red-500'
} as const

export const STATUS_BG_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/10',
  success: 'bg-green-500/10',
  error: 'bg-red-500/10'
} as const
