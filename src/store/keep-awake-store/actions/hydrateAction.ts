import type { StoreApi } from 'zustand'

import tauriApi from '@/tauri-api-bridge'

import type { KeepAwakeStore } from '../types'

/**
 * Read the current keep-awake + lid-close status from the backend and mark the
 * store hydrated. Failures are swallowed (treated as inactive) so a transient
 * backend error never blocks the tile from rendering.
 */
export async function hydrateAction(
  set: StoreApi<KeepAwakeStore>['setState'],
): Promise<void> {
  try {
    const [active, lid] = await Promise.all([
      tauriApi.keepAwakeStatus(),
      tauriApi.keepAwakeLidStatus().catch(() => false),
    ])
    set({ isActive: active, lidClose: lid, isHydrated: true })
  } catch {
    set({ isHydrated: true })
  }
}
