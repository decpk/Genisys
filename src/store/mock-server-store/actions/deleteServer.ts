import type { MockServerStoreState, MockServerStoreActions } from '@/components/MockServer/MockServer.types'
import { persistSelectedServerId } from '@/store/mock-server-store'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('mock-server')

export async function deleteServerAction(
  set: (partial: Partial<MockServerStoreState>) => void,
  get: () => MockServerStoreState & MockServerStoreActions,
  id: string
): Promise<void> {
  const result = await (window as any).api.mockDeleteServer(id)
  if (result.success) {
    const { endpoints, selectedServerId, selectedEndpointId } = get()
    const newEndpoints = { ...endpoints }
    delete newEndpoints[id]

    if (selectedServerId === id) persistSelectedServerId(null)

    set({
      servers: get().servers.filter((s) => s.id !== id),
      endpoints: newEndpoints,
      selectedServerId: selectedServerId === id ? null : selectedServerId,
      selectedEndpointId: selectedServerId === id ? null : selectedEndpointId,
    })
  } else {
    const message = result.error || 'Unknown error'
    console.error('[MockServer] Failed to delete server:', message)
    toast.error(`Failed to delete server: ${message}`)
    throw new Error(message)
  }
}
