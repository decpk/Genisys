import { useMockServerStore } from '@/store/mock-server-store'
import type { MockEndpoint } from '@/components/MockServer/MockServer.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_delete_endpoint',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_delete_endpoint',
      description: 'Delete an endpoint. This is a destructive action that requires user confirmation.',
      parameters: {
        type: 'object',
        properties: {
          endpointId: { type: 'string', description: 'The endpoint ID to delete' },
        },
        required: ['endpointId'],
      },
    },
  },
  execute: async (args, ctx): Promise<ToolResult> => {
    const endpointId = args.endpointId as string
    if (!endpointId) {
      return { kind: 'error', message: 'endpointId is required.' }
    }
    const { endpoints } = useMockServerStore.getState()
    let endpoint: MockEndpoint | undefined
    for (const serverEndpoints of Object.values(endpoints)) {
      endpoint = serverEndpoints.find((e) => e.id === endpointId)
      if (endpoint) break
    }
    if (!endpoint) {
      return { kind: 'error', message: `Endpoint "${endpointId}" not found.` }
    }
    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'mockserver_delete_endpoint',
          description: `Delete endpoint: ${endpoint.method} ${endpoint.path}`,
          items: [{ path: `${endpoint.method} ${endpoint.path}`, type: 'endpoint', details: `Status: ${endpoint.status_code}, Type: ${endpoint.response_type}` }],
          warning: `This will permanently delete the endpoint "${endpoint.method} ${endpoint.path}". This cannot be undone.`,
        },
        executeAfterConfirm: async () => {
          await useMockServerStore.getState().deleteEndpoint(endpointId)
          return `✅ Endpoint "${endpoint!.method} ${endpoint!.path}" deleted.`
        },
      }
    }
    await useMockServerStore.getState().deleteEndpoint(endpointId)
    return { kind: 'success', message: `✅ Endpoint "${endpoint.method} ${endpoint.path}" deleted.` }
  },
}

export default tool
