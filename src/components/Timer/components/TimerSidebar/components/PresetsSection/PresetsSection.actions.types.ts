import type { PresetRow } from '../../../../hooks/useAllPresets.types'

export type PresetRowActionType = 'edit' | 'duplicate' | 'delete' | 'togglePin'

export interface PresetRowAction {
  type: PresetRowActionType
  row: PresetRow
}

export type PresetRowActionHandler = (action: PresetRowAction) => void
