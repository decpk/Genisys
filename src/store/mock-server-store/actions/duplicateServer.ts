import type { MockServerStoreState, MockServerStoreActions } from '@/components/MockServer/MockServer.types'
import { persistSelectedServerId } from '@/store/mock-server-store'

export async function duplicateServerAction(
  set: (partial: Partial<MockServerStoreState>) => void,
  get: () => MockServerStoreState & MockServerStoreActions,
  id: string
): Promise<void> {
  const result = await (window as any).api.mockDuplicateServer(id)
  if (result.success) {
    const newServer = result.data.server
    const newEndpoints = result.data.endpoints ?? []
    const { servers, endpoints } = get()

    persistSelectedServerId(newServer.id)

    set({
      servers: [...servers, newServer],
      endpoints: { ...endpoints, [newServer.id]: newEndpoints },
      selectedServerId: newServer.id,
    })
  }
}
