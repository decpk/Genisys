import { create } from 'zustand'

import { disableAction } from './keep-awake-store/actions/disableAction'
import { enableAction } from './keep-awake-store/actions/enableAction'
import { hydrateAction } from './keep-awake-store/actions/hydrateAction'
import { recheckPermissionAction } from './keep-awake-store/actions/recheckPermissionAction'
import { setLidCloseAction } from './keep-awake-store/actions/setLidCloseAction'
import { toggleAction } from './keep-awake-store/actions/toggleAction'
import type { KeepAwakeStore } from './keep-awake-store/types'

/**
 * Runtime-only keep-awake store (NOT persisted). State is hydrated from the
 * backend on first mount via `hydrate()`. Each action is a thin wrapper that
 * delegates to a service file under `keep-awake-store/actions/`.
 */
export const useKeepAwakeStore = create<KeepAwakeStore>((set, get) => ({
  // ── state ────────────────────────────────────────────────────────────────
  isActive: false,
  isHydrated: false,
  isBusy: false,
  error: null,
  permission: 'unknown',
  pendingEnable: false,
  lidClose: false,
  isLidBusy: false,
  lidError: null,

  // ── actions (delegated) ────────────────────────────────────────────────────
  hydrate: () => hydrateAction(set),
  enable: () => enableAction(set),
  disable: () => disableAction(set, get),
  toggle: () => toggleAction(set, get),
  recheckPermission: () => recheckPermissionAction(set, get),
  setLidClose: (enabled) => setLidCloseAction(set, get, enabled),
}))
