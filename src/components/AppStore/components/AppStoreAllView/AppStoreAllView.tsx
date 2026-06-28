import { LayoutList } from 'lucide-react'

import { APP_CATALOG } from '../../data/app-catalog'
import { AppStoreAppCard } from '../AppStoreAppCard'
import { AppStoreViewHeader } from '../AppStoreViewHeader'

/**
 * Lists every app in the catalog sorted alphabetically by name and
 * stacked in a single column (top to bottom) for easy scanning.
 */
export function AppStoreAllView(): React.JSX.Element {
  const apps = [...APP_CATALOG].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="px-8 py-6">
      <AppStoreViewHeader
        icon={LayoutList}
        accentColor="#8B5CF6"
        title="All Apps"
        subtitle={`All ${apps.length} apps, sorted A\u2013Z.`}
        count={apps.length}
      />
      <div className="grid grid-cols-1 gap-2">
        {apps.map((app) => (
          <AppStoreAppCard key={app.id} app={app} showCategory />
        ))}
      </div>
    </div>
  )
}
