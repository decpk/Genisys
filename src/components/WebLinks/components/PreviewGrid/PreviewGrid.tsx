import { SavedPreviewCard } from '../SavedPreviewCard'

import type { PreviewGridProps } from './PreviewGrid.types'
import { STYLES } from './PreviewGrid.styles'

/** Responsive auto-fill grid of saved-preview cards. */
export function PreviewGrid(props: PreviewGridProps): React.JSX.Element {
  const { previews } = props

  const cards = previews.map((preview) => (
    <SavedPreviewCard key={preview.id} preview={preview} />
  ))

  return <div className={STYLES.grid}>{cards}</div>
}
