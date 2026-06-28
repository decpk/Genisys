import type { PresetRow } from '../../../../../../hooks/useAllPresets.types'
import type { PresetRowActionHandler } from '../../PresetsSection.actions.types'

export interface PresetRowItemProps {
  row: PresetRow
  onSelect: (row: PresetRow) => void
  onAction: PresetRowActionHandler
}
