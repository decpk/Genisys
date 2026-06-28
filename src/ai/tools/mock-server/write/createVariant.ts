import { useMockServerStore } from '@/store/mock-server-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_create_variant',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_create_variant',
      description:
        'Create a response variant for an endpoint. Variants let one endpoint return different responses based on the endpoint variant mode (sequence, weighted random, or match rules).',
      parameters: {
        type: 'object',
        properties: {
          endpointId: { type: 'string', description: 'The endpoint ID to add the variant to' },
          name: { type: 'string', description: 'A human-readable name for the variant' },
          statusCode: { type: 'number', description: 'HTTP status code returned by this variant (default 200)' },
          responseHeaders: { type: 'string', description: 'Response headers as a JSON string' },
          responseBody: { type: 'string', description: 'The response body for this variant' },
          matchRules: { type: 'string', description: 'Match rules as a JSON string (used when the endpoint is in match-rules variant mode)' },
          weight: { type: 'number', description: 'Relative weight for weighted-random selection' },
          orderIndex: { type: 'number', description: 'Order index for sequence selection' },
          isActive: { type: 'boolean', description: 'Whether the variant is active (default true)' },
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
    const created = await useMockServerStore.getState().createVariant({
      endpointId,
      name: args.name as string | undefined,
      statusCode: args.statusCode as number | undefined,
      responseHeaders: args.responseHeaders as string | undefined,
      responseBody: args.responseBody as string | undefined,
      matchRules: args.matchRules as string | undefined,
      weight: args.weight as number | undefined,
      orderIndex: args.orderIndex as number | undefined,
      isActive: args.isActive as boolean | undefined,
    })
    if (!created) {
      return { kind: 'error', message: 'Failed to create variant.' }
    }
    return {
      kind: 'success',
      message: `✅ Variant "${created.name || '(unnamed)'}" created (id: \`${created.id}\`).`,
    }
  },
}

export default tool
