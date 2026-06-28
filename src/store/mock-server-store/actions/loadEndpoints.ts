import type { MockServerStoreState, MockServerStoreActions } from '@/components/MockServer/MockServer.types'
import { readActiveEndpointId } from '@/store/mock-server-store'

export async function loadEndpointsAction(
  set: (partial: Partial<MockServerStoreState>) => void,
  get: () => MockServerStoreState & MockServerStoreActions,
  serverId: string
): Promise<void> {
  const result = await (window as any).api.mockLoadEndpoints(serverId)
  if (result.success) {
    const endpointIds: string[] = result.data.map((ep: any) => ep.id)
    // Restore the last active endpoint if it still exists, else default to first
    const persistedActive = readActiveEndpointId()
    const activeId =
      persistedActive && endpointIds.includes(persistedActive)
        ? persistedActive
        : endpointIds[0] ?? null
    set({
      endpoints: { ...get().endpoints, [serverId]: result.data },
      openEndpointTabs: endpointIds,
      activeEndpointTabId: activeId,
      selectedEndpointId: activeId,
    })
  }
}
