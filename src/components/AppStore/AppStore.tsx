import { AppShell } from '@/components/AppShell'

import { AppStoreViewContext } from './AppStoreViewContext'
import { AppStoreHeader } from './components/AppStoreHeader'
import { AppStoreMain } from './components/AppStoreMain'
import { AppStoreSidebar } from './components/AppStoreSidebar'
import { useAppStoreData } from './hooks/useAppStoreData'

/**
 * App Store \u2014 the Mac App Store-style surface where users browse and
 * enable/disable Genisys apps. Renders:
 *  - left rail (Discover / Installed / Categories)
 *  - top header with search bar (+ back button on detail)
 *  - main area routed via {@link AppStoreMain}
 */
export function AppStore(): React.JSX.Element {
  const viewState = useAppStoreData()

  return (
    <AppStoreViewContext.Provider value={viewState}>
      <AppShell
        appId="appstore"
        sidebar={<AppStoreSidebar />}
        sidebarWidth={220}
        sidebarMinWidth={180}
        sidebarMaxWidth={320}
      >
        <div className="flex h-full flex-col">
          <AppStoreHeader />
          <div className="flex-1 min-h-0">
            <AppStoreMain />
          </div>
        </div>
      </AppShell>
    </AppStoreViewContext.Provider>
  )
}
