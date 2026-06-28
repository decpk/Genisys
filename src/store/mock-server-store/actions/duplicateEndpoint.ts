import type { MockServerStoreState, MockServerStoreActions } from '@/components/MockServer/MockServer.types'

export async function duplicateEndpointAction(
  set: (partial: Partial<MockServerStoreState>) => void,
  get: () => MockServerStoreState & MockServerStoreActions,
  id: string
): Promise<void> {
  const result = await (window as any).api.mockDuplicateEndpoint(id)
  if (result.success) {
    const { endpoints, openEndpointTabs } = get()
    const serverId = result.data.server_id
    const existing = endpoints[serverId] || []
    const newId = result.data.id
    set({
      endpoints: { ...endpoints, [serverId]: [...existing, result.data] },
      openEndpointTabs: [...openEndpointTabs, newId],
      activeEndpointTabId: newId,
      selectedEndpointId: newId,
    })
  }
}
