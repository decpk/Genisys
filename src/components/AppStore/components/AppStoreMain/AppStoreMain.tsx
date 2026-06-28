import { useAppStoreView } from '../../AppStoreViewContext'
import { AppStoreAllView } from '../AppStoreAllView'
import { AppStoreCategoryView } from '../AppStoreCategoryView'
import { AppStoreDetail } from '../AppStoreDetail'
import { AppStoreDiscover } from '../AppStoreDiscover'
import { AppStoreInstalledView } from '../AppStoreInstalledView'
import { AppStoreSearchView } from '../AppStoreSearchView'
import { renderAppStoreView } from './utils/renderAppStoreView'

/**
 * Routes the current {@link AppStoreView} to the right view component.
 * Each branch is delegated to a single dedicated component so this
 * router stays compact.
 */
export function AppStoreMain(): React.JSX.Element {
  const { view } = useAppStoreView()
  const rendered = renderAppStoreView(view, {
    Discover: AppStoreDiscover,
    All: AppStoreAllView,
    Installed: AppStoreInstalledView,
    Category: AppStoreCategoryView,
    Search: AppStoreSearchView,
    Detail: AppStoreDetail,
  })
  return <div className="h-full overflow-y-auto">{rendered}</div>
}
