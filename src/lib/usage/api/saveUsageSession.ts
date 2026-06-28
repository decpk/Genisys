import tauriApi from '@/tauri-api-bridge'

import type { UsageSessionRow } from '../usage.types'

/**
 * Persists a single usage segment row to the backend. Throws when the backend
 * reports failure so callers (the tracker) can swallow it in fire-and-forget
 * try/catch.
 */
export async function saveUsageSession(row: UsageSessionRow): Promise<void> {
  const result = await tauriApi.saveUsageSession(row)
  if (!result?.success) {
    throw new Error(result?.error ?? 'Failed to save usage session.')
  }
}
