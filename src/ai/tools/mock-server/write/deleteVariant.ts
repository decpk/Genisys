import { useMockServerStore } from '@/store/mock-server-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_delete_variant',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_delete_variant',
      description:
        'Delete a response variant from an endpoint. This is a destructive action that requires user confirmation.',
      parameters: {
        type: 'object',
        properties: {
          variantId: { type: 'string', description: 'The variant ID to delete' },
          endpointId: { type: 'string', description: 'The endpoint ID that owns the variant' },
        },
        required: ['variantId', 'endpointId'],
      },
    },
  },
  execute: async (args, ctx): Promise<ToolResult> => {
    const variantId = args.variantId as string
    const endpointId = args.endpointId as string
    if (!variantId || !endpointId) {
      return { kind: 'error', message: 'variantId and endpointId are required.' }
    }
    const existing = (useMockServerStore.getState().variants[endpointId] || []).find(
      (v) => v.id === variantId,
    )
    const label = existing?.name || variantId
    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'mockserver_delete_variant',
          description: `Delete variant: "${label}"`,
          items: [{ path: label, type: 'variant', details: `Endpoint: ${endpointId}` }],
          warning: `This will permanently delete the variant "${label}". This cannot be undone.`,
        },
        executeAfterConfirm: async () => {
          await useMockServerStore.getState().deleteVariant(variantId, endpointId)
          return `✅ Variant "${label}" deleted.`
        },
      }
    }
    await useMockServerStore.getState().deleteVariant(variantId, endpointId)
    return { kind: 'success', message: `✅ Variant "${label}" deleted.` }
  },
}

export default tool
