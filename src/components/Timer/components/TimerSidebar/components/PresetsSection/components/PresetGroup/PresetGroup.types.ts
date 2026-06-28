import type { LucideIcon } from 'lucide-react'

import type { PresetRow } from '../../../../../../hooks/useAllPresets.types'
import type { PresetRowActionHandler } from '../../PresetsSection.actions.types'

export interface PresetGroupProps {
  title: string
  /** Leading icon shown next to the group title. */
  icon: LucideIcon
  rows: PresetRow[]
  onSelect: (row: PresetRow) => void
  onAction: PresetRowActionHandler
  /**
   * Optional trailing slot rendered in the group header (right-aligned).
   * Used by "Your Presets" to host the "+ New Preset" button.
   */
  trailing?: React.ReactNode
  /**
   * Optional message shown when `rows` is empty. When omitted and the
   * group has no rows, the group is rendered with an empty body.
   */
  emptyMessage?: string
}
