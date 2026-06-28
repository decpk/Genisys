import { create } from 'zustand'

import { closeAction } from './settings-drawer-store/actions/closeAction'
import { initDrawerAction } from './settings-drawer-store/actions/initDrawerAction'
import { openAction } from './settings-drawer-store/actions/openAction'
import { setActiveSectionAction } from './settings-drawer-store/actions/setActiveSectionAction'
import { setPositionAction } from './settings-drawer-store/actions/setPositionAction'
import { setSizeAction } from './settings-drawer-store/actions/setSizeAction'
import { toggleAction } from './settings-drawer-store/actions/toggleAction'
import { SETTINGS_DRAWER_DEFAULTS } from './settings-drawer-store/settings-drawer-store.constants'
import type { SettingsDrawerStore } from './settings-drawer-store/settings-drawer-store.types'

/**
 * Visibility + persisted state for the floating Settings window.
 *
 * Layered architecture (per `.claude.md` "Store-centric with Service
 * Layer"):
 *   constants → actions/* → store (thin wrappers) → hook → view
 *
 * `isOpen` is intentionally never persisted — the window always starts
 * closed at launch.
 */
export const useSettingsDrawerStore = create<SettingsDrawerStore>()(
  (set, get) => ({
    ...SETTINGS_DRAWER_DEFAULTS,
    open: () => openAction(set),
    close: () => closeAction(set),
    toggle: () => toggleAction(get, set),
    setPosition: (position) => setPositionAction(get, set, position),
    setSize: (size) => setSizeAction(get, set, size),
    setActiveSection: (section) => setActiveSectionAction(set, section),
    initDrawer: () => initDrawerAction(set),
  }),
)

export type {
  SettingsDrawerState,
  SettingsDrawerActions,
  SettingsDrawerStore,
  WindowPosition,
  WindowSize,
} from './settings-drawer-store/settings-drawer-store.types'
export {
  SETTINGS_WINDOW_SIZE,
  SETTINGS_WINDOW_DEFAULT_SIZE,
} from './settings-drawer-store/settings-drawer-store.constants'
