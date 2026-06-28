import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'apiclient_get_current_context',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_get_current_context',
      description: 'Get the current API client UI context: active collection, request, environment, sidebar tab, and sending status.',
      parameters: { type: 'object', properties: {} },
    },
  },
  execute: async (): Promise<ToolResult> => {
    const initial = useApiClientStore.getState()
    if (!initial.isLoaded) {
      await initial.loadAll()
    }
    const store = useApiClientStore.getState()
    const { activeCollectionId, activeRequestId, activeEnvironmentId, sidebarTab, isSending } = store

    const activeCollection = activeCollectionId
      ? store.collections.find((c) => c.id === activeCollectionId)
      : null
    const activeRequest = activeRequestId
      ? store.requests.find((r) => r.id === activeRequestId)
      : null
    const activeEnv = activeEnvironmentId
      ? store.environments.find((e) => e.id === activeEnvironmentId)
      : null

    const message = [
      '**Current API Client Context**',
      '',
      `- **Active Collection:** ${activeCollection ? `${activeCollection.name} (${activeCollectionId})` : '(none)'}`,
      `- **Active Request:** ${activeRequest ? `${activeRequest.method} ${activeRequest.name} (${activeRequestId})` : '(none)'}`,
      `- **Active Environment:** ${activeEnv ? `${activeEnv.name} (${activeEnvironmentId})` : '(none)'}`,
      `- **Sidebar Tab:** ${sidebarTab}`,
      `- **Is Sending:** ${isSending}`,
    ].join('\n')

    return { kind: 'success', message }
  },
}

export default tool
