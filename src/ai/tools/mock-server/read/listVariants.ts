import { useMockServerStore } from '@/store/mock-server-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_list_variants',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_list_variants',
      description:
        'List all response variants for a given endpoint. Variants let an endpoint return different responses (by sequence, weight, or match rules).',
      parameters: {
        type: 'object',
        properties: {
          endpointId: {
            type: 'string',
            description: 'The endpoint ID to list variants for',
          },
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
    const store = useMockServerStore.getState()
    await store.loadVariants(endpointId)
    const variants = useMockServerStore.getState().variants[endpointId] || []
    if (variants.length === 0) {
      return {
        kind: 'success',
        message: `No variants found for endpoint \`${endpointId}\`.`,
      }
    }
    const lines = variants.map(
      (v) =>
        `- **${v.name || '(unnamed)'}** (id: \`${v.id}\`) → ${v.status_code}, weight: ${v.weight}, order: ${v.order_index}, active: ${v.is_active}`,
    )
    return {
      kind: 'success',
      message: `**Variants for endpoint \`${endpointId}\` (${variants.length})**\n\n${lines.join('\n')}`,
    }
  },
}

export default tool
