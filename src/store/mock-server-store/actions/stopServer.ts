import type { MockServerStoreState, MockServerStoreActions } from '@/components/MockServer/MockServer.types'

export async function stopServerAction(
  get: () => MockServerStoreState & MockServerStoreActions,
  serverId: string
): Promise<void> {
  await (window as any).api.mockStopServer(serverId)
  await get().refreshRunningServers()
}
