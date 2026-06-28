import type { MockServerStoreState, MockServerStoreActions } from '@/components/MockServer/MockServer.types'
import { persistActiveEndpointId } from '@/store/mock-server-store'

export async function deleteEndpointAction(
  set: (partial: Partial<MockServerStoreState>) => void,
  get: () => MockServerStoreState & MockServerStoreActions,
  id: string
): Promise<void> {
  const result = await (window as any).api.mockDeleteEndpoint(id)
  if (result.success) {
    const { endpoints, selectedEndpointId, openEndpointTabs, activeEndpointTabId, runningServers } = get()

    // Find which server owned this endpoint before removing it
    let ownerServerId: string | null = null
    for (const [serverId, eps] of Object.entries(endpoints)) {
      if (eps.some((e) => e.id === id)) {
        ownerServerId = serverId
        break
      }
    }

    const newEndpoints: Record<string, any[]> = {}
    for (const [serverId, eps] of Object.entries(endpoints)) {
      newEndpoints[serverId] = eps.filter((e) => e.id !== id)
    }
    const newTabs = openEndpointTabs.filter((t) => t !== id)
    let newActive = activeEndpointTabId
    if (activeEndpointTabId === id) {
      const idx = openEndpointTabs.indexOf(id)
      newActive = newTabs[Math.min(idx, newTabs.length - 1)] ?? null
      persistActiveEndpointId(newActive)
    }
    set({
      endpoints: newEndpoints,
      selectedEndpointId: selectedEndpointId === id ? newActive : selectedEndpointId,
      openEndpointTabs: newTabs,
      activeEndpointTabId: newActive,
    })

    // Hot-reload: restart server if running so deleted endpoint is removed from routes
    if (ownerServerId && runningServers.some((s) => s.server_id === ownerServerId)) {
      await get().stopServer(ownerServerId)
      await get().startServer(ownerServerId)
    }
  }
}
