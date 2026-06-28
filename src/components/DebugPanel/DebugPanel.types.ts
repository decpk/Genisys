import type { ComponentType, LazyExoticComponent } from 'react'
import type { LucideIcon } from 'lucide-react'

import type { ApiRequestEntry, RequestStatus } from '@/store/debug-store'

export type DebugTab = "api" | "db" | "store" | "ai" | "report-bug" | "request-feature";

export interface DebugPanelProps {
  defaultTab?: DebugTab;
}

export interface DebugTabConfig {
  id: DebugTab
  label: string
  icon: LucideIcon
  devOnly: boolean
  Component: LazyExoticComponent<ComponentType>
}

export interface UseDebugPanelDataReturn {
  visibleTabs: ReadonlyArray<DebugTabConfig>
  effectiveTab: DebugTab
  activeConfig: DebugTabConfig
  handleTabChange: (value: string) => void
}

export interface RequestRowProps {
  request: ApiRequestEntry
  isSelected: boolean
  onSelect: (id: string) => void
}

export interface RequestDetailProps {
  request: ApiRequestEntry
}

export interface StatusFilterOption {
  value: RequestStatus | 'all'
  label: string
}
