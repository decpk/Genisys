import { useEffect } from 'react'

import { useWindowFocus } from '@/hooks/useWindowFocus'
import { useKeepAwakeStore } from '@/store/keep-awake-store'
import tauriApi from '@/tauri-api-bridge'

export interface UseKeepAwakeTileDataResult {
  isActive: boolean
  isBusy: boolean
  isHydrated: boolean
  error: string | null
  pendingEnable: boolean
  lidClose: boolean
  isLidBusy: boolean
  lidError: string | null
  toggle: () => void
  setLidClose: (enabled: boolean) => void
  openAccessibilitySettings: () => void
  recheckPermission: () => void
}

/**
 * Orchestrator for the Dashboard Stay Awake tile. Selects primitives from
 * `useKeepAwakeStore`, hydrates backend status on first mount, and — while the
 * store is armed for an Accessibility grant — re-checks trust whenever the Genisys
 * window regains focus so the toggle switches on automatically once the user
 * returns from System Settings.
 */
export function useKeepAwakeTileData(): UseKeepAwakeTileDataResult {
  const isActive = useKeepAwakeStore((s) => s.isActive)
  const isBusy = useKeepAwakeStore((s) => s.isBusy)
  const isHydrated = useKeepAwakeStore((s) => s.isHydrated)
  const error = useKeepAwakeStore((s) => s.error)
  const pendingEnable = useKeepAwakeStore((s) => s.pendingEnable)
  const lidClose = useKeepAwakeStore((s) => s.lidClose)
  const isLidBusy = useKeepAwakeStore((s) => s.isLidBusy)
  const lidError = useKeepAwakeStore((s) => s.lidError)
  const hydrate = useKeepAwakeStore((s) => s.hydrate)
  const toggleStore = useKeepAwakeStore((s) => s.toggle)
  const setLidCloseStore = useKeepAwakeStore((s) => s.setLidClose)
  const recheckStore = useKeepAwakeStore((s) => s.recheckPermission)

  const focused = useWindowFocus()

  useEffect(() => {
    if (!isHydrated) void hydrate()
  }, [isHydrated, hydrate])

  // When the user returns to Genisys (focus regained) while armed for an
  // Accessibility grant, re-check trust and auto-enable if it is now granted.
  // `recheckStore` is a stable zustand action ref, so this never loops.
  useEffect(() => {
    if (focused && pendingEnable) void recheckStore()
  }, [focused, pendingEnable, recheckStore])

  const toggle = (): void => {
    void toggleStore()
  }
  const setLidClose = (enabled: boolean): void => {
    void setLidCloseStore(enabled)
  }
  const recheckPermission = (): void => {
    void recheckStore()
  }
  const openAccessibilitySettings = (): void => {
    void tauriApi.openAccessibilitySettings()
  }

  return {
    isActive,
    isBusy,
    isHydrated,
    error,
    pendingEnable,
    lidClose,
    isLidBusy,
    lidError,
    toggle,
    setLidClose,
    openAccessibilitySettings,
    recheckPermission,
  }
}
