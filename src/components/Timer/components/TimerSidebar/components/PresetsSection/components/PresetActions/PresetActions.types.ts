import type { PresetRow } from '../../../../../../hooks/useAllPresets.types'
import type {
  PresetRowAction,
  PresetRowActionHandler,
} from '../../PresetsSection.actions.types'

export interface PresetActionsProps {
  row: PresetRow
  onAction: PresetRowActionHandler
}

export type { PresetRow, PresetRowAction, PresetRowActionHandler }
