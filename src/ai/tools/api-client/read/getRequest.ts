import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'apiclient_get_request',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_get_request',
      description: 'Get full details of a specific API request including URL, method, headers, params, body, and auth.',
      parameters: {
        type: 'object',
        properties: {
          requestId: { type: 'string', description: 'The ID of the request to retrieve' },
        },
        required: ['requestId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const requestId = args.requestId as string
    if (!requestId) {
      return { kind: 'error', message: 'requestId is required.' }
    }

    const store = useApiClientStore.getState()
    const request = store.requests.find((r) => r.id === requestId)
    if (!request) {
      return { kind: 'error', message: `Request "${requestId}" not found.` }
    }

    const enabledHeaders = request.headers.filter((h) => h.enabled)
    const enabledParams = request.params.filter((p) => p.enabled)

    const message = [
      `**${request.method} ${request.name}**`,
      '',
      `- **URL:** ${request.url || '(not set)'}`,
      `- **Body Type:** ${request.bodyType}`,
      `- **Auth Type:** ${request.authType}`,
      `- **Collection ID:** ${request.collectionId}`,
      `- **Folder ID:** ${request.folderId || '(root)'}`,
      `- **ID:** ${request.id}`,
      '',
      enabledHeaders.length > 0
        ? ['**Headers:**', ...enabledHeaders.map((h) => `- \`${h.key}: ${h.value}\``)].join('\n')
        : '**Headers:** (none)',
      '',
      enabledParams.length > 0
        ? ['**Params:**', ...enabledParams.map((p) => `- \`${p.key}=${p.value}\``)].join('\n')
        : '**Params:** (none)',
      '',
      request.bodyContent ? `**Body:**\n\`\`\`\n${request.bodyContent}\n\`\`\`` : '**Body:** (empty)',
    ].join('\n')

    return { kind: 'success', message }
  },
}

export default tool
