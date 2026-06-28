import { useClipboardLabelStore } from '@/store/clipboard-label-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'clipboard_list_labels',
  definition: {
    type: 'function',
    function: {
      name: 'clipboard_list_labels',
      description:
        'List all available clipboard labels with their names, colors, and IDs.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  execute: async (): Promise<ToolResult> => {
    const store = useClipboardLabelStore.getState()
    if (!store.isLoaded) {
      await store.loadLabels()
    }

    const { labels } = useClipboardLabelStore.getState()
    if (labels.length === 0) {
      return { kind: 'success', message: 'No labels created yet.' }
    }

    const lines = labels.map((l) => `| ${l.name} | ${l.color} | ${l.id} |`)

    const message = [
      `**Clipboard Labels** (${labels.length})`,
      '',
      '| Name | Color | ID |',
      '|------|-------|----|',
      ...lines,
    ].join('\n')

    return { kind: 'success', message }
  },
}

export default tool
