import type { PanelIndicator } from '../../RightPanelTabs.types'

export interface TabsTriggerProps extends React.ComponentProps<'button'> {
  value: string
  icon?: React.ReactNode
  /** Optional attention indicator overlaid on the trigger. */
  indicator?: PanelIndicator | null
}
