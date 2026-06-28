import { useClipboardStore } from '@/store/clipboard-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'clipboard_clear_all',
  definition: {
    type: 'function',
    function: {
      name: 'clipboard_clear_all',
      description:
        'Clear all clipboard items. This is a destructive action that requires user confirmation. Pinned items will also be removed.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  execute: async (_args, ctx): Promise<ToolResult> => {
    const stats = useClipboardStore.getState().stats

    if (stats.total === 0) {
      return { kind: 'success', message: 'Clipboard is already empty.' }
    }

    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'clipboard_clear_all',
          description: `Clear all ${stats.total} clipboard items`,
          items: [
            { path: `${stats.textCount} text items`, type: 'text' },
            { path: `${stats.imageCount} image items`, type: 'image' },
          ],
          warning: `This will permanently delete all ${stats.total} clipboard items. This cannot be undone.`,
        },
        executeAfterConfirm: async () => {
          await useClipboardStore.getState().clearAll()
          return `✅ All ${stats.total} clipboard items cleared.`
        },
      }
    }

    await useClipboardStore.getState().clearAll()
    return { kind: 'success', message: `✅ All ${stats.total} clipboard items cleared.` }
  },
}

export default tool
