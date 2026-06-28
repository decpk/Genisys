import { useSettingsStore } from '@/store/settings-store'

import { AppLoader } from './AppLoader'

export function AppShellLoader(): React.JSX.Element {
  const sidebarPosition = useSettingsStore((s) => s.sidebarPosition)
  const isRight = sidebarPosition === 'right'

  const borderSide = isRight ? 'border-l' : 'border-r'

  return (
    <div className={`flex h-full w-full ${isRight ? 'flex-row-reverse' : ''}`}>
      <div className={`h-full w-[300px] shrink-0 ${borderSide} border-border/40 bg-card`} />
      <div className="flex-1 min-w-0 h-full">
        <AppLoader />
      </div>
    </div>
  )
}
