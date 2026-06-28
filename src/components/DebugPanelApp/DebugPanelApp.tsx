import { useEffect, useState } from 'react'

import { DebugPanel } from '@/components/DebugPanel'
import { AppLoader } from '@/components/AppLoader'
import { useThemeStore } from '@/store/theme-store'
import { initDebugListener } from '@/store/debug-store'

export function DebugPanelApp(): React.JSX.Element {
  const initTheme = useThemeStore((s) => s.initTheme)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initTheme().then(() => setReady(true))
    initDebugListener()
  }, [initTheme])

  if (!ready) return <AppLoader />

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background text-foreground">
      <DebugPanel />
    </div>
  )
}
