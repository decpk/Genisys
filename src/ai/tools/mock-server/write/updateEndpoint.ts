import { useMockServerStore } from '@/store/mock-server-store'
import type { MockEndpoint } from '@/components/MockServer/MockServer.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_update_endpoint',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_update_endpoint',
      description: 'Update an existing endpoint on a mock server.',
      parameters: {
        type: 'object',
        properties: {
          endpointId: { type: 'string', description: 'The endpoint ID to update' },
          method: { type: 'string', description: 'HTTP method' },
          path: { type: 'string', description: 'The endpoint path' },
          statusCode: { type: 'number', description: 'HTTP status code' },
          responseHeaders: { type: 'string', description: 'Response headers as a JSON string' },
          responseBody: { type: 'string', description: 'Response body content' },
          responseType: { type: 'string', enum: ['static', 'ai'], description: 'Response type: static or ai' },
          aiPrompt: { type: 'string', description: 'AI prompt for generating responses' },
          aiSchema: { type: 'string', description: 'JSON schema for AI-generated responses' },
          aiCount: { type: 'number', description: 'Number of items for AI to generate' },
          delayMs: { type: 'number', description: 'Response delay in milliseconds' },
          description: { type: 'string', description: 'Description of the endpoint' },
          isActive: { type: 'boolean', description: 'Whether the endpoint is active' },
        },
        required: ['endpointId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const endpointId = args.endpointId as string
    if (!endpointId) {
      return { kind: 'error', message: 'endpointId is required.' }
    }
    const { endpoints } = useMockServerStore.getState()
    let existing: MockEndpoint | undefined
    for (const serverEndpoints of Object.values(endpoints)) {
      existing = serverEndpoints.find((e) => e.id === endpointId)
      if (existing) break
    }
    if (!existing) {
      return { kind: 'error', message: `Endpoint "${endpointId}" not found.` }
    }
    const updated: MockEndpoint = {
      ...existing,
      method: (args.method as string)?.toUpperCase() ?? existing.method,
      path: (args.path as string) ?? existing.path,
      status_code: (args.statusCode as number) ?? existing.status_code,
      response_headers: (args.responseHeaders as string) ?? existing.response_headers,
      response_body: (args.responseBody as string) ?? existing.response_body,
      response_type: (args.responseType as 'static' | 'ai') ?? existing.response_type,
      ai_prompt: (args.aiPrompt as string) ?? existing.ai_prompt,
      ai_schema: (args.aiSchema as string) ?? existing.ai_schema,
      ai_count: (args.aiCount as number) ?? existing.ai_count,
      delay_ms: (args.delayMs as number) ?? existing.delay_ms,
      description: (args.description as string) ?? existing.description,
      is_active: (args.isActive as boolean) ?? existing.is_active,
    }
    await useMockServerStore.getState().updateEndpoint(updated)
    return {
      kind: 'success',
      message: `✅ Endpoint **${updated.method} ${updated.path}** updated.`,
    }
  },
}

export default tool
