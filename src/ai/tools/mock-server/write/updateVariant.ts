import { useMockServerStore } from '@/store/mock-server-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_update_variant',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_update_variant',
      description:
        'Update an existing response variant. Only the provided fields are changed; omitted fields keep their current values.',
      parameters: {
        type: 'object',
        properties: {
          variantId: { type: 'string', description: 'The variant ID to update' },
          endpointId: { type: 'string', description: 'The endpoint ID that owns the variant' },
          name: { type: 'string', description: 'A human-readable name for the variant' },
          statusCode: { type: 'number', description: 'HTTP status code returned by this variant' },
          responseHeaders: { type: 'string', description: 'Response headers as a JSON string' },
          responseBody: { type: 'string', description: 'The response body for this variant' },
          matchRules: { type: 'string', description: 'Match rules as a JSON string' },
          weight: { type: 'number', description: 'Relative weight for weighted-random selection' },
          orderIndex: { type: 'number', description: 'Order index for sequence selection' },
          isActive: { type: 'boolean', description: 'Whether the variant is active' },
        },
        required: ['variantId', 'endpointId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const variantId = args.variantId as string
    const endpointId = args.endpointId as string
    if (!variantId || !endpointId) {
      return { kind: 'error', message: 'variantId and endpointId are required.' }
    }
    const existing = (useMockServerStore.getState().variants[endpointId] || []).find(
      (v) => v.id === variantId,
    )
    if (!existing) {
      return { kind: 'error', message: `Variant "${variantId}" not found for endpoint \`${endpointId}\`.` }
    }
    await useMockServerStore.getState().updateVariant({
      id: variantId,
      endpointId,
      name: (args.name as string | undefined) ?? existing.name,
      statusCode: (args.statusCode as number | undefined) ?? existing.status_code,
      responseHeaders: (args.responseHeaders as string | undefined) ?? existing.response_headers,
      responseBody: (args.responseBody as string | undefined) ?? existing.response_body,
      matchRules: (args.matchRules as string | undefined) ?? existing.match_rules,
      weight: (args.weight as number | undefined) ?? existing.weight,
      orderIndex: (args.orderIndex as number | undefined) ?? existing.order_index,
      isActive: (args.isActive as boolean | undefined) ?? existing.is_active,
    })
    return {
      kind: 'success',
      message: `✅ Variant "${(args.name as string) || existing.name || '(unnamed)'}" updated.`,
    }
  },
}

export default tool
