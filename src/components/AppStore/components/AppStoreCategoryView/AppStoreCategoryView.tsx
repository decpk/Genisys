import { findCategory } from '../../data/categories'
import { getAppsByCategory } from '../../data/app-catalog'
import { AppStoreAppCard } from '../AppStoreAppCard'
import { AppStoreViewHeader } from '../AppStoreViewHeader'
import type { AppStoreCategoryViewProps } from './AppStoreCategoryView.types'

/** Renders every app in a single category as a vertical grid. */
export function AppStoreCategoryView(
  props: AppStoreCategoryViewProps,
): React.JSX.Element {
  const { categoryId } = props
  const category = findCategory(categoryId)
  const apps = getAppsByCategory(categoryId)

  return (
    <div className="px-8 py-6">
      <AppStoreViewHeader
        icon={category?.icon}
        accentColor={category?.accentColor}
        title={category?.label ?? 'Apps'}
        subtitle={category?.tagline}
        count={apps.length}
      />
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
        {apps.map((app) => (
          <AppStoreAppCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  )
}
