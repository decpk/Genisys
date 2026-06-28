import type {
  MockServerStoreState,
  MockServerStoreActions,
} from '@/components/MockServer/MockServer.types'

export async function deleteVariantAction(
  set: (partial: Partial<MockServerStoreState>) => void,
  get: () => MockServerStoreState & MockServerStoreActions,
  id: string,
  endpointId: string
): Promise<void> {
  const result = await (window as any).api.mockDeleteVariant(id)
  if (result.success) {
    const { variants, runningServers, endpoints } = get()
    const existing = variants[endpointId] || []
    set({
      variants: {
        ...variants,
        [endpointId]: existing.filter((v) => v.id !== id),
      },
    })

    // Hot-reload: restart the owning server if running so the deletion is live
    const serverId = Object.keys(endpoints).find((sid) =>
      (endpoints[sid] || []).some((ep) => ep.id === endpointId)
    )
    if (serverId && runningServers.some((s) => s.server_id === serverId)) {
      await get().stopServer(serverId)
      await get().startServer(serverId)
    }
  }
}
