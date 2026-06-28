import { useMemo, useState, useTransition } from 'react'

import { DEBUG_TABS, DEV_ONLY_TABS } from './DebugPanel.constants'
import type { DebugPanelProps, DebugTab, UseDebugPanelDataReturn } from './DebugPanel.types'

export function useDebugPanelData(props: DebugPanelProps): UseDebugPanelDataReturn {
  const { defaultTab } = props
  const isDev = import.meta.env.DEV
  const initialTab: DebugTab = defaultTab ?? (isDev ? 'api' : 'report-bug')
  const [activeTab, setActiveTab] = useState<DebugTab>(initialTab)
  const [, startTransition] = useTransition()

  const handleTabChange = (value: string): void => {
    startTransition(() => setActiveTab(value as DebugTab))
  }

  const isRedirected = !isDev && DEV_ONLY_TABS.includes(activeTab)
  const effectiveTab: DebugTab = isRedirected ? 'report-bug' : activeTab

  const visibleTabs = useMemo(() => DEBUG_TABS.filter((tab) => isDev || !tab.devOnly), [isDev])

  const activeConfig = useMemo(
    () => DEBUG_TABS.find((tab) => tab.id === effectiveTab) ?? DEBUG_TABS[0],
    [effectiveTab],
  )

  return { visibleTabs, effectiveTab, activeConfig, handleTabChange }
}
