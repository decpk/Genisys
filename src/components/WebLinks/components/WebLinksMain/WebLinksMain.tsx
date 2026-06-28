import { CollectionView } from '../CollectionView'

import { STYLES } from './WebLinksMain.styles'

/**
 * Main content column: the saved-links collection fills the whole column.
 * Pure layout — all behavior lives in the children's hooks.
 */
export function WebLinksMain(): React.JSX.Element {
  return (
    <div className={STYLES.root}>
      <div className={STYLES.stage}>
        <CollectionView />
      </div>
    </div>
  )
}
