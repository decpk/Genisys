import { useMockServerStore } from '@/store/mock-server-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_create_endpoint',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_create_endpoint',
      description: 'Create a new endpoint on a mock server.',
      parameters: {
        type: 'object',
        properties: {
          serverId: { type: 'string', description: 'The server ID to add the endpoint to' },
          method: { type: 'string', description: 'HTTP method (GET, POST, PUT, DELETE, PATCH, etc.)' },
          path: { type: 'string', description: 'The endpoint path (e.g. /api/users)' },
          statusCode: { type: 'number', description: 'HTTP status code to return (default 200)' },
          responseHeaders: { type: 'string', description: 'Response headers as a JSON string' },
          responseBody: { type: 'string', description: 'Response body content' },
          responseType: { type: 'string', enum: ['static', 'ai'], description: 'Response type: static or ai (default static)' },
          aiPrompt: { type: 'string', description: 'AI prompt for generating responses (when responseType is ai)' },
          aiSchema: { type: 'string', description: 'JSON schema for AI-generated responses' },
          aiCount: { type: 'number', description: 'Number of items for AI to generate' },
          delayMs: { type: 'number', description: 'Response delay in milliseconds' },
          description: { type: 'string', description: 'Description of the endpoint' },
          isActive: { type: 'boolean', description: 'Whether the endpoint is active (default true)' },
        },
        required: ['serverId', 'method', 'path'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const serverId = args.serverId as string
    const method = args.method as string
    const path = args.path as string
    if (!serverId || !method || !path) {
      return { kind: 'error', message: 'serverId, method, and path are required.' }
    }
    const result = await useMockServerStore.getState().createEndpoint({
      server_id: serverId,
      method: method.toUpperCase(),
      path,
      status_code: (args.statusCode as number) ?? 200,
      response_headers: (args.responseHeaders as string) ?? '',
      response_body: (args.responseBody as string) ?? '',
      response_type: (args.responseType as 'static' | 'ai') ?? 'static',
      ai_prompt: (args.aiPrompt as string) ?? '',
      ai_schema: (args.aiSchema as string) ?? '',
      ai_count: (args.aiCount as number) ?? 0,
      delay_ms: (args.delayMs as number) ?? 0,
      description: (args.description as string) ?? '',
      is_active: (args.isActive as boolean) ?? true,
    })
    if (!result) {
      return { kind: 'error', message: 'Failed to create endpoint.' }
    }
    return {
      kind: 'success',
      message: `✅ Endpoint **${method.toUpperCase()} ${path}** created (id: \`${result.id}\`).`,
    }
  },
}

export default tool
