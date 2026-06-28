import type { QuickShareStatus } from './types'

/** Read the current sharing status (used to hydrate the UI on mount). */
export async function quickShareStatus(): Promise<QuickShareStatus> {
  const res = await window.api.quickShareStatus()
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to read QuickShare status')
  }
  return res.data
}
