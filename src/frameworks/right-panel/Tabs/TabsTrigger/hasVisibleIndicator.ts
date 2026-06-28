import type { PanelIndicator } from '../../RightPanelTabs.types'

/** True if the indicator should render at all. */
export function hasVisibleIndicator(
  indicator: PanelIndicator | null | undefined,
): indicator is PanelIndicator {
  if (!indicator) return false
  if (indicator.kind === 'count' && indicator.count <= 0) return false
  return true
}
