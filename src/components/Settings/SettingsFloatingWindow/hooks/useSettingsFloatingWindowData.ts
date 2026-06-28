import { useSettingsDrawerStore } from '@/store/settings-drawer-store'

import type { UseSettingsFloatingWindowDataReturn } from '../SettingsFloatingWindow.types'

/**
 * Selects primitive slices from the settings drawer store. Each
 * selector returns a stable scalar / persisted reference — never a
 * fresh object literal — to satisfy zustand's `useSyncExternalStore`
 * snapshot equality (see `user-memory: zustand-pitfalls`).
 */
export function useSettingsFloatingWindowData(): UseSettingsFloatingWindowDataReturn {
  const isOpen = useSettingsDrawerStore((s) => s.isOpen)
  const isLoaded = useSettingsDrawerStore((s) => s.isLoaded)
  const position = useSettingsDrawerStore((s) => s.position)
  const size = useSettingsDrawerStore((s) => s.size)
  const setPosition = useSettingsDrawerStore((s) => s.setPosition)
  const setSize = useSettingsDrawerStore((s) => s.setSize)
  const close = useSettingsDrawerStore((s) => s.close)

  return {
    isOpen,
    isLoaded,
    position,
    size,
    setPosition,
    setSize,
    close,
  }
}
