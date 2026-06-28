import { useSettingsStore } from '@/store/settings-store'

import type { UseGenisysAppReturn } from './useGenisysApp.types'
import { useAppMode } from './useAppMode'
import { useAppInit } from './useAppInit'

export function useGenisysApp(): UseGenisysAppReturn {
  const { activeApp, setActiveApp, activated, deactivateApp } = useAppMode();
  const activityBarPosition = useSettingsStore((s) => s.activityBarPosition)

  useAppInit(activeApp)

  return {
    activeApp,
    setActiveApp,
    activated,
    deactivateApp,
    activityBarPosition
  }
}
