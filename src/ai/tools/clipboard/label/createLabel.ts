import { useClipboardLabelStore } from '@/store/clipboard-label-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'clipboard_create_label',
  definition: {
    type: 'function',
    function: {
      name: 'clipboard_create_label',
      description:
        'Create a new label for organizing clipboard items.',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The label name.',
          },
          color: {
            type: 'string',
            description: 'The label color as a hex code (e.g., "#ef4444"). Defaults to "#6366f1".',
          },
        },
        required: ['name'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const name = args.name as string
    if (!name?.trim()) {
      return { kind: 'error', message: 'Label name is required.' }
    }

    const color = (args.color as string) || '#6366f1'
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
      return { kind: 'error', message: `Invalid color: "${color}". Use hex format like #ef4444.` }
    }

    // Check for duplicate name
    const existing = useClipboardLabelStore.getState().labels
    if (existing.some((l) => l.name.toLowerCase() === name.trim().toLowerCase())) {
      return { kind: 'error', message: `Label "${name.trim()}" already exists.` }
    }

    try {
      const label = await useClipboardLabelStore.getState().createLabel(name.trim(), color)
      return { kind: 'success', message: `✅ Label "${label.name}" created (color: ${label.color}, ID: ${label.id}).` }
    } catch (e) {
      return { kind: 'error', message: `Failed to create label: ${e instanceof Error ? e.message : String(e)}` }
    }
  },
}

export default tool
