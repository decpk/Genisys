import { Compass, LayoutGrid, LayoutList } from 'lucide-react'

import { useSettingsStore } from '@/store/settings-store'

import { APP_CATEGORIES } from '../../data/categories'
import { getCategoryCount, getTotalAppCount } from '../../data/app-catalog'
import { useAppStoreView } from '../../AppStoreViewContext'
import { AppStoreSidebarItem } from './AppStoreSidebarItem'

/**
 * Left rail of the App Store. Mirrors the Mac App Store's sidebar:
 * a Browse section (Discover / All / Installed), then categories with
 * icons and live app counts so the whole catalog is scannable at a glance.
 */
export function AppStoreSidebar(): React.JSX.Element {
  const { view, openDiscover, openAll, openInstalled, openCategory } =
    useAppStoreView()
  const enabledApps = useSettingsStore((s) => s.enabledApps)

  return (
    <div className="flex h-full w-full flex-col gap-1 p-3">
      <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Browse
      </div>
      <AppStoreSidebarItem
        icon={Compass}
        label="Discover"
        active={view.kind === 'discover' || view.kind === 'search'}
        onClick={openDiscover}
      />
      <AppStoreSidebarItem
        icon={LayoutList}
        label="All"
        count={getTotalAppCount()}
        active={view.kind === 'all'}
        onClick={openAll}
      />
      <AppStoreSidebarItem
        icon={LayoutGrid}
        label="Installed"
        count={enabledApps.length}
        active={view.kind === 'installed'}
        onClick={openInstalled}
      />

      <div className="mt-4 px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Categories
      </div>

      <div className="flex flex-col gap-0.5">
        {APP_CATEGORIES.map((cat) => (
          <AppStoreSidebarItem
            key={cat.id}
            icon={cat.icon}
            iconColor={cat.accentColor}
            label={cat.label}
            count={getCategoryCount(cat.id)}
            active={view.kind === 'category' && view.id === cat.id}
            onClick={() => openCategory(cat.id)}
          />
        ))}
      </div>
    </div>
  )
}
