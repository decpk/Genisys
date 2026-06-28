import { useCallback } from 'react'

import type { AppView } from '@/components/ActivityBar'
import { useNavigationStore } from '@/store/navigation-store'
import { useSettingsStore } from '@/store/settings-store'

import { ALWAYS_ENABLED_APPS } from '@/store/settings-store/AppView.constants'

export interface UseAppStoreActions {
  /** Whether `appId` is currently in the user's `enabledApps`. */
  isInstalled: (appId: AppView) => boolean
  /** Add `appId` to `enabledApps`. No-op if already enabled. */
  install: (appId: AppView) => void
  /** Remove `appId` from `enabledApps`. Refuses always-enabled apps. */
  uninstall: (appId: AppView) => void
  /**
   * Navigate to `appId`. If it isn't installed yet, install it first
   * so the ActivityBar / app shell mounts it.
   */
  open: (appId: AppView) => void
  /** Whether `appId` is "locked" (cannot be removed). */
  isLocked: (appId: AppView) => boolean
}

/**
 * Encapsulates the App Store's mutation surface against the settings
 * + navigation stores. Callers (cards + the detail page) only need
 * these five primitives.
 */
export function useAppStoreActions(): UseAppStoreActions {
  const enabledApps = useSettingsStore((s) => s.enabledApps)
  const toggleAppEnabled = useSettingsStore((s) => s.toggleAppEnabled)
  const setActiveApp = useNavigationStore((s) => s.setActiveApp)

  const isInstalled = useCallback(
    (appId: AppView) => enabledApps.includes(appId),
    [enabledApps],
  )

  const isLocked = useCallback(
    (appId: AppView) => ALWAYS_ENABLED_APPS.includes(appId),
    [],
  )

  const install = useCallback(
    (appId: AppView) => {
      if (enabledApps.includes(appId)) return
      toggleAppEnabled(appId)
    },
    [enabledApps, toggleAppEnabled],
  )

  const uninstall = useCallback(
    (appId: AppView) => {
      if (!enabledApps.includes(appId)) return
      if (ALWAYS_ENABLED_APPS.includes(appId)) return
      toggleAppEnabled(appId)
    },
    [enabledApps, toggleAppEnabled],
  )

  const open = useCallback(
    (appId: AppView) => {
      if (!enabledApps.includes(appId)) {
        toggleAppEnabled(appId)
      }
      setActiveApp(appId)
    },
    [enabledApps, toggleAppEnabled, setActiveApp],
  )

  return { isInstalled, install, uninstall, open, isLocked }
}
