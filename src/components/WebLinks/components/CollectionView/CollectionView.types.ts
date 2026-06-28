import type { SavedPreview } from '@/components/WebLinks/WebLinks.types'

import type { CollectionState } from './utils/resolveCollectionState'

/** View-model returned by `useCollectionViewData`. */
export interface CollectionViewModel {
  /** Which collection state to render. */
  state: CollectionState
  /** The folder-filtered, searched, sorted previews to show in the grid. */
  visible: SavedPreview[]
}
