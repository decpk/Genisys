import type {
  MockServerStoreState,
  MockServerStoreActions,
} from '@/components/MockServer/MockServer.types'

export async function updateVariantAction(
  set: (partial: Partial<MockServerStoreState>) => void,
  get: () => MockServerStoreState & MockServerStoreActions,
  params: {
    id: string
    endpointId: string
    name?: string
    statusCode?: number
    responseHeaders?: string
    responseBody?: string
    matchRules?: string
    weight?: number
    orderIndex?: number
    isActive?: boolean
  }
): Promise<void> {
  const result = await (window as any).api.mockUpdateVariant(params)
  if (result.success) {
    const { variants, runningServers, endpoints } = get()
    const existing = variants[params.endpointId] || []
    set({
      variants: {
        ...variants,
        [params.endpointId]: existing.map((v) =>
          v.id === params.id ? result.data : v
        ),
      },
    })

    // Hot-reload: restart the owning server if running so the change is live
    const serverId = Object.keys(endpoints).find((sid) =>
      (endpoints[sid] || []).some((ep) => ep.id === params.endpointId)
    )
    if (serverId && runningServers.some((s) => s.server_id === serverId)) {
      await get().stopServer(serverId)
      await get().startServer(serverId)
    }
  }
}
