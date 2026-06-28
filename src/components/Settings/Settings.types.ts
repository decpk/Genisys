import type { ActivityBarPosition, SidebarPosition } from '@/store/settings-store'

import type { SettingsSearchResult } from './settings-search/settings-search.types'

export type SettingsSection = 'user' | 'theme' | 'security' | 'clock' | 'dashboard' | 'dailyPlan' | 'explorer' | 'terminal' | 'chat' | 'aiAssistant' | 'library' | 'notes' | 'clipboard' | 'voice' | 'tts' | 'keyboard' | 'notifications' | 'usage' | 'privacy' | 'developer' | 'about'

export interface SettingsSectionItem {
  key: SettingsSection
  label: string
  icon: React.ComponentType<{ size: number }>
}

export interface SettingsSectionGroup {
  label: string
  items: ReadonlyArray<SettingsSectionItem>
}

export interface SettingRowProps {
  label: string
  description: string
  children: React.ReactNode
}

export interface LayoutPositionSettingProps {
  activityBarPosition: ActivityBarPosition
  sidebarPosition: SidebarPosition
  showLabels: boolean
  onActivityBarChange: (p: ActivityBarPosition) => void
  onSidebarChange: (p: SidebarPosition) => void
  onShowLabelsChange: (show: boolean) => void
}

export interface LayoutPreviewProps {
  activityBar: ActivityBarPosition
  sidebar: SidebarPosition
}

export interface UseSettingsDataReturn {
  activeSection: SettingsSection
  sidebarPosition: SidebarPosition
  query: string
  setQuery: (value: string) => void
  search: SettingsSearchResult
  handleSectionChange: (section: SettingsSection) => void
  navGroups: ReadonlyArray<SettingsSectionGroup>
  fuzzyEnabled: boolean
  setFuzzyEnabled: (enabled: boolean) => void
  searchContainerRef: React.RefObject<HTMLDivElement | null>
}
