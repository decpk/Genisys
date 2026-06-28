import type { MockServerStoreState } from '@/components/MockServer/MockServer.types'

export async function stopAllServersAction(
  set: (partial: Partial<MockServerStoreState>) => void
): Promise<number> {
  const result = await (window as any).api.mockStopAllServers()
  if (result.success) {
    set({ runningServers: [] })
    return result.data
  }
  return 0
}
