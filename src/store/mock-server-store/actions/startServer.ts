import type { MockServerStoreState, MockServerStoreActions } from '@/components/MockServer/MockServer.types'

export async function startServerAction(
  get: () => MockServerStoreState & MockServerStoreActions,
  serverId: string
): Promise<{ success: boolean; error?: string; suggested_port?: number }> {
  const result = await (window as any).api.mockStartServer(serverId)
  if (result.success) {
    await get().refreshRunningServers()
  }
  return result
}
