import type { RightPanelTabsProps } from '../RightPanelTabs.types'

export function getDefaultTab(panels: RightPanelTabsProps['panels']): string {
  const explicit = panels.find((p) => p.defaultTab)
  return explicit?.id ?? panels[0]?.id ?? ''
}
