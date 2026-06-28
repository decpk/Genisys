import type {
  MockEndpoint,
  MockServerStoreState,
  MockServerStoreActions,
} from '@/components/MockServer/MockServer.types'

export async function createEndpointAction(
  set: (partial: Partial<MockServerStoreState>) => void,
  get: () => MockServerStoreState & MockServerStoreActions,
  params: Omit<
    MockEndpoint,
    'id' | 'created_at' | 'updated_at' | 'variant_mode' | 'ai_mode' | 'ai_cache_ttl_ms' | 'ai_pool_size'
  >
): Promise<MockEndpoint | null> {
  const result = await (window as any).api.mockCreateEndpoint({
    serverId: params.server_id,
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
  })
  if (result.success) {
    const { endpoints, openEndpointTabs, runningServers } = get()
    const serverId = params.server_id
    const existing = endpoints[serverId] || []
    const newId = result.data.id
    set({
      endpoints: { ...endpoints, [serverId]: [...existing, result.data] },
      openEndpointTabs: [...openEndpointTabs, newId],
      activeEndpointTabId: newId,
      selectedEndpointId: newId,
    })

    // Hot-reload: restart server if running so new endpoint is immediately available
    if (runningServers.some((s) => s.server_id === serverId)) {
      await get().stopServer(serverId)
      await get().startServer(serverId)
    }

    return result.data
  }
  return null
}
