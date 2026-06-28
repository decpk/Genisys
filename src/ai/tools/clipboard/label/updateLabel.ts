import { useClipboardLabelStore } from '@/store/clipboard-label-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'clipboard_update_label',
  definition: {
    type: 'function',
    function: {
      name: 'clipboard_update_label',
      description:
        'Update an existing clipboard label name or color.',
      parameters: {
        type: 'object',
        properties: {
          labelId: {
            type: 'string',
            description: 'The ID of the label to update.',
          },
          name: {
            type: 'string',
            description: 'The new label name.',
          },
          color: {
            type: 'string',
            description: 'The new label color as a hex code (e.g., "#ef4444").',
          },
        },
        required: ['labelId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const labelId = args.labelId as string
    if (!labelId) {
      return { kind: 'error', message: 'labelId is required.' }
    }

    const labels = useClipboardLabelStore.getState().labels
    const label = labels.find((l) => l.id === labelId)
    if (!label) {
      return { kind: 'error', message: `Label "${labelId}" not found.` }
    }

    const name = (args.name as string)?.trim() || label.name
    const color = (args.color as string) || label.color

    if (color && !/^#[0-9a-fA-F]{6}$/.test(color)) {
      return { kind: 'error', message: `Invalid color: "${color}". Use hex format like #ef4444.` }
    }

    try {
      await useClipboardLabelStore.getState().updateLabel(labelId, name, color)
      return { kind: 'success', message: `✅ Label updated: "${name}" (${color}).` }
    } catch (e) {
      return { kind: 'error', message: `Failed to update label: ${e instanceof Error ? e.message : String(e)}` }
    }
  },
}

export default tool
