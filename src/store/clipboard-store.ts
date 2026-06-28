import { create } from 'zustand'
import type { ClipboardState, ClipboardActions } from './clipboard-store/clipboard-store.types'
import { CLIPBOARD_INITIAL_STATE } from './clipboard-store/clipboard-store.constants'
import { loadItemsAction } from './clipboard-store/actions/loadItems'
import { prependItemAction } from './clipboard-store/actions/prependItem'
import { moveItemToTopAction } from './clipboard-store/actions/moveItemToTop'
import { removeItemAction } from './clipboard-store/actions/removeItem'
import { updateTextAction } from './clipboard-store/actions/updateText'
import { clearAllAction } from './clipboard-store/actions/clearAll'
import { copyToClipboardAction } from './clipboard-store/actions/copyToClipboard'
import { togglePinAction } from './clipboard-store/actions/togglePin'
import { setFilterAction } from './clipboard-store/actions/setFilter'
import { setSearchQueryAction } from './clipboard-store/actions/setSearchQuery'
import { toggleFuzzySearchAction } from './clipboard-store/actions/toggleFuzzySearch'
import { loadStatsAction } from './clipboard-store/actions/loadStats'
import { addLabelToItemAction } from './clipboard-store/actions/addLabelToItem'
import { removeLabelFromItemAction } from './clipboard-store/actions/removeLabelFromItem'
import { updateItemAnalysisAction } from './clipboard-store/actions/updateItemAnalysis'
import { updateImageDescriptionAction } from './clipboard-store/actions/updateImageDescription'
import { openPreviewAction } from './clipboard-store/actions/openPreview'
import { closePreviewAction } from './clipboard-store/actions/closePreview'
import { previewNextAction } from './clipboard-store/actions/previewNext'
import { previewPrevAction } from './clipboard-store/actions/previewPrev'
import { resetStoreAction } from './clipboard-store/actions/resetStore'

export type { ClipboardItem, ClipboardStats, FilterType } from './clipboard-store/clipboard-store.types'

export const useClipboardStore = create<ClipboardState & ClipboardActions>((set, get) => ({
  ...CLIPBOARD_INITIAL_STATE,
  loadItems: (reset) => loadItemsAction(get, set, reset),
  prependItem: (item) => prependItemAction(get, set, item),
  moveItemToTop: (item) => moveItemToTopAction(get, set, item),
  removeItem: (id) => removeItemAction(get, set, id),
  updateText: (id, textContent) => updateTextAction(get, set, id, textContent),
  clearAll: () => clearAllAction(get, set),
  copyToClipboard: (id) => copyToClipboardAction(id),
  togglePin: (id) => togglePinAction(get, set, id),
  setFilter: (filter) => setFilterAction(get, set, filter),
  setSearchQuery: (query) => setSearchQueryAction(get, set, query),
  toggleFuzzySearch: () => toggleFuzzySearchAction(get, set),
  loadStats: () => loadStatsAction(set),
  addLabelToItem: (itemId, label) => addLabelToItemAction(get, set, itemId, label),
  removeLabelFromItem: (itemId, labelId) => removeLabelFromItemAction(get, set, itemId, labelId),
  updateItemAnalysis: (itemId, description, status, extractedText) => updateItemAnalysisAction(get, set, itemId, description, status, extractedText),
  updateImageDescription: (itemId, description) => updateImageDescriptionAction(get, set, itemId, description),
  reset: () => resetStoreAction(set),
  openPreview: (id) => openPreviewAction(set, id),
  closePreview: () => closePreviewAction(set),
  previewNext: () => previewNextAction(get, set),
  previewPrev: () => previewPrevAction(get, set),
}))
