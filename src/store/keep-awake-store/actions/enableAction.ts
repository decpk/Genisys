import type { StoreApi } from 'zustand'

import tauriApi from '@/tauri-api-bridge'

import { ACCESSIBILITY_NOTICE } from '../constants'
import type { KeepAwakeStore } from '../types'

/**
 * Turn keep-awake on.
 *
 * The presence nudge needs macOS Accessibility trust, so we pre-check it: when
 * not yet granted we surface the native prompt (which registers Genisys in the
 * Accessibility list) and "arm" `pendingEnable` so the feature switches on
 * automatically once the user grants it and returns to Genisys. When already
 * trusted we start the inhibitor + nudge immediately.
 */
export async function enableAction(
  set: StoreApi<KeepAwakeStore>['setState'],
): Promise<void> {
  set({ isBusy: true })
  try {
    const trusted = await tauriApi.accessibilityStatus()
    if (!trusted) {
      // Surface the system prompt and arm a focus-driven auto-enable.
      await tauriApi.requestAccessibility()
      set({
        isActive: false,
        permission: 'denied',
        pendingEnable: true,
        error: ACCESSIBILITY_NOTICE,
      })
      return
    }
    await tauriApi.keepAwakeStart()
    set({
      isActive: true,
      permission: 'granted',
      pendingEnable: false,
      error: null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    set({ isActive: false, pendingEnable: false, error: message })
  } finally {
    set({ isBusy: false })
  }
}
