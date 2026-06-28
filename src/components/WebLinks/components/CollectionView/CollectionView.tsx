import { Bookmark } from 'lucide-react'

import { AppLoader } from '@/components/AppLoader'

import { SortFilterBar } from '../SortFilterBar'
import { PreviewGrid } from '../PreviewGrid'

import { STYLES } from './CollectionView.styles'
import { useCollectionViewData } from './useCollectionViewData'

/**
 * The saved-previews surface shown when the stage is idle. Early-return guards
 * cover the loading and empty states; the grid vs no-matches body is
 * precomputed into a variable to avoid JSX ternaries.
 */
export function CollectionView(): React.JSX.Element {
  const { state, visible } = useCollectionViewData()

  if (state === 'loading') {
    return (
      <div className={STYLES.center}>
        <AppLoader />
      </div>
    )
  }

  if (state === 'empty') {
    return (
      <div className={STYLES.center}>
        <Bookmark size={40} className={STYLES.emptyIcon} />
        <p className={STYLES.emptyText}>
          No saved links yet — paste a link above to save it.
        </p>
      </div>
    )
  }

  let bodyEl: React.JSX.Element = <PreviewGrid previews={visible} />
  if (state === 'no-matches') {
    bodyEl = <p className={STYLES.noMatches}>No previews match your filters.</p>
  }

  return (
    <div className={STYLES.root}>
      <SortFilterBar />
      <div className={STYLES.body}>{bodyEl}</div>
    </div>
  )
}
