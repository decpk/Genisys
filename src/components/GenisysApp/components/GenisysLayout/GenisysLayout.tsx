import { useLibraryStore } from '@/store/library-store'
import { useSettingsStore } from '@/store/settings-store'
import type { GenisysLayoutProps } from './GenisysLayout.types'

const LAYOUT_CLASSES: Record<string, string> = {
  top: 'flex-col',
  bottom: 'flex-col',
  left: 'flex-row',
  right: 'flex-row',
}

const AB_ORDER: Record<string, string> = {
  top: 'order-first',
  left: 'order-first',
  bottom: 'order-last',
  right: 'order-last',
}

export function GenisysLayout({
  activityBarPosition,
  activityBarEl,
  mainContentEl
}: GenisysLayoutProps): React.JSX.Element {
  const distractionFree = useLibraryStore((s) => s.distractionFree)
  const lastActiveApp = useSettingsStore((s) => s.lastActiveApp)
  const dfHideActivityBar = useSettingsStore((s) => s.libraryDFHideActivityBar)
  const activityBarHidden = useSettingsStore((s) => s.activityBarHidden)
  const hideActivityBar =
    activityBarHidden ||
    (distractionFree && lastActiveApp === 'library' && dfHideActivityBar)

  return (
    <div className={`flex h-full w-full ${LAYOUT_CLASSES[activityBarPosition]}`}>
      {!hideActivityBar && (
        <div className={AB_ORDER[activityBarPosition]}>
          {activityBarEl}
        </div>
      )}
      <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden order-2">
        {mainContentEl}
      </div>
    </div>
  )
}
