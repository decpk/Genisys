import type { MockServerStoreState } from '@/components/MockServer/MockServer.types'

export async function refreshRunningServersAction(
  set: (partial: Partial<MockServerStoreState>) => void
): Promise<void> {
  try {
    const result = await (window as any).api.mockGetRunning()
    if (result.success) {
      set({ runningServers: result.data })
    }
  } catch {
    // silently ignore — init loading will proceed regardless
  }
}
