import { create } from 'zustand'

import type { ClipboardLabelStore } from './clipboard-label-store.types'
import { loadLabelsAction } from './actions/loadLabels'
import { createLabelAction } from './actions/createLabel'
import { updateLabelAction } from './actions/updateLabel'
import { deleteLabelAction } from './actions/deleteLabel'
import { addLabelToItemAction } from './actions/addLabelToItem'
import { removeLabelFromItemAction } from './actions/removeLabelFromItem'

export const useClipboardLabelStore = create<ClipboardLabelStore>()((set, get) => ({
  labels: [],
  isLoaded: false,

  loadLabels: () => loadLabelsAction(get, set),
  createLabel: (name, color) => createLabelAction(get, set, name, color),
  updateLabel: (id, name, color) => updateLabelAction(get, set, id, name, color),
  deleteLabel: (id) => deleteLabelAction(get, set, id),
  addLabelToItem: (itemId, labelId) => addLabelToItemAction(itemId, labelId),
  removeLabelFromItem: (itemId, labelId) => removeLabelFromItemAction(itemId, labelId),
}))
