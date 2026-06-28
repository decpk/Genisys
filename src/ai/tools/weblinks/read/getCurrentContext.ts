import { useWebLinksStore } from '@/store/weblinks-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'previewer_get_current_context',
  definition: {
    type: 'function',
    function: {
      name: 'previewer_get_current_context',
      description:
        'Get the current Previewer context: collection stats — folder count, saved-preview count, the selected folder, the active sort, and the filter query.',
      parameters: { type: 'object', properties: {} },
    },
  },
  execute: async (): Promise<ToolResult> => {
    const store = useWebLinksStore.getState()
    const { folders, previews, selectedFolder, sortKey, sortDirection, filterQuery } = store

    const message = [
      '**Current Previewer Context**',
      '',
      '**Collection**',
      `- **Folders:** ${folders.length}`,
      `- **Saved Previews:** ${previews.length}`,
      `- **Selected Folder:** ${selectedFolder}`,
      `- **Sort:** ${sortKey} ${sortDirection}`,
      `- **Filter:** ${filterQuery ? `"${filterQuery}"` : '(none)'}`,
    ].join('\n')

    return { kind: 'success', message }
  },
}

export default tool
