import { LayoutGrid } from 'lucide-react'

import { useSettingsStore } from '@/store/settings-store'

import { APP_CATALOG } from '../../data/app-catalog'
import { AppStoreAppCard } from '../AppStoreAppCard'
import { AppStoreViewHeader } from '../AppStoreViewHeader'

/**
 * Lists every app currently in the user's `enabledApps`. Order matches
 * the master catalog so apps appear consistently across views.
 */
export function AppStoreInstalledView(): React.JSX.Element {
  const enabledApps = useSettingsStore((s) => s.enabledApps)
  const installed = APP_CATALOG.filter((app) => enabledApps.includes(app.id))

  return (
    <div className="px-8 py-6">
      <AppStoreViewHeader
        icon={LayoutGrid}
        accentColor="#0EA5E9"
        title="Installed"
        subtitle={`${installed.length} app${
          installed.length === 1 ? '' : 's'
        } enabled on your Genisys.`}
        count={installed.length}
      />
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
        {installed.map((app) => (
          <AppStoreAppCard key={app.id} app={app} showCategory />
        ))}
      </div>
    </div>
  )
}
