import { useMockServerStore } from '@/store/mock-server-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_get_current_context',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_get_current_context',
      description: 'Get the current MockServer UI context, including selected server, running servers count, and generation status.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  execute: async (): Promise<ToolResult> => {
    // Sync running state from the backend so the running-servers count is
    // accurate (the store's cached `runningServers` can be stale).
    await useMockServerStore.getState().refreshRunningServers()
    const store = useMockServerStore.getState()
    const message = [
      '**MockServer Current Context**',
      '',
      `- **Selected Server ID:** ${store.selectedServerId ?? 'none'}`,
      `- **Selected Endpoint ID:** ${store.selectedEndpointId ?? 'none'}`,
      `- **Running Servers:** ${store.runningServers.length}`,
      `- **Is Generating:** ${store.isGenerating}`,
      `- **Is Loaded:** ${store.isLoaded}`,
    ].join('\n')
    return { kind: 'success', message }
  },
}

export default tool
