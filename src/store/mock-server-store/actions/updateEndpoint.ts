import type {
  MockEndpoint,
  MockServerStoreState,
  MockServerStoreActions,
} from '@/components/MockServer/MockServer.types'

export async function updateEndpointAction(
  set: (partial: Partial<MockServerStoreState>) => void,
  get: () => MockServerStoreState & MockServerStoreActions,
  params: MockEndpoint
): Promise<void> {
  const result = await (window as any).api.mockUpdateEndpoint({
    id: params.id,
    method: params.method,
    path: params.path,
    statusCode: params.status_code,
    responseHeaders: params.response_headers,
    responseBody: params.response_body,
    responseType: params.response_type,
    aiPrompt: params.ai_prompt,
    aiSchema: params.ai_schema,
    aiCount: params.ai_count,
    delayMs: params.delay_ms,
    description: params.description,
    isActive: params.is_active,
    variantMode: params.variant_mode,
    aiMode: params.ai_mode,
    aiCacheTtlMs: params.ai_cache_ttl_ms,
    aiPoolSize: params.ai_pool_size,
  })
  if (result.success) {
    const { endpoints, runningServers } = get()
    const serverId = params.server_id
    const existing = endpoints[serverId] || []
    const updated = result.data ?? params
    set({
      endpoints: {
        ...endpoints,
        [serverId]: existing.map((e) => (e.id === params.id ? updated : e)),
      },
    })

    // Hot-reload: restart server if running so routes stay in sync
    if (runningServers.some((s) => s.server_id === serverId)) {
      await get().stopServer(serverId)
      await get().startServer(serverId)
    }
  }
}
