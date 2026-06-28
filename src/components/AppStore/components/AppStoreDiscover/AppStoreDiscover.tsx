import { APP_CATEGORIES } from '../../data/categories'
import { getCategoryCount, getFeaturedApps } from '../../data/app-catalog'
import { useAppStoreView } from '../../AppStoreViewContext'
import { AppStoreCategoryTile } from '../AppStoreCategoryTile'
import { AppStoreFeaturedCard } from '../AppStoreFeaturedCard'
import { AppStoreSection } from '../AppStoreSection'

/**
 * Default landing view for the App Store. Curated, not a dump: a
 * "Featured" rail and a "Browse by Category" tile grid that routes into
 * each category. Archived apps are intentionally omitted here — they
 * surface only inside their category and in search.
 */
export function AppStoreDiscover(): React.JSX.Element {
  const { openCategory } = useAppStoreView()
  const featured = getFeaturedApps()

  return (
    <div className="px-8 py-6">
      <AppStoreSection
        title="Featured"
        subtitle="Hand-picked apps to power your workflow."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((app) => (
            <AppStoreFeaturedCard key={app.id} app={app} />
          ))}
        </div>
      </AppStoreSection>

      <AppStoreSection
        title="Browse by Category"
        subtitle="Jump straight to the kind of app you need."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {APP_CATEGORIES.map((cat) => (
            <AppStoreCategoryTile
              key={cat.id}
              category={cat}
              count={getCategoryCount(cat.id)}
              onClick={() => openCategory(cat.id)}
            />
          ))}
        </div>
      </AppStoreSection>
    </div>
  )
}
