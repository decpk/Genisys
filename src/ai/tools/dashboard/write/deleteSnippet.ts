import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { useSnippetsStore } from '@/store/snippets-store'

const tool: ToolModule = {
  name: 'dashboard_delete_snippet',
  definition: {
    type: 'function',
    function: {
      name: 'dashboard_delete_snippet',
      description: 'Delete a snippet. Requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          snippetId: { type: 'string', description: 'ID of the snippet to delete' },
        },
        required: ['snippetId'],
      },
    },
  },
  execute: async (args, ctx): Promise<ToolResult> => {
    const snippetId = args.snippetId as string
    const store = useSnippetsStore.getState()
    const snippet = store.snippets.find((s) => s.id === snippetId)

    if (!snippet) {
      return { kind: 'error', message: `Snippet "${snippetId}" not found.` }
    }

    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'dashboard_delete_snippet',
          description: `Delete snippet: "${snippet.title}"`,
          items: [{ path: snippet.id, type: 'snippet', details: `Title: ${snippet.title}` }],
          warning: 'This will permanently delete the snippet.',
        },
        executeAfterConfirm: async () => {
          await useSnippetsStore.getState().removeSnippet(snippetId)
          return `✅ Snippet "${snippet.title}" deleted.`
        },
      }
    }

    await store.removeSnippet(snippetId)
    return { kind: 'success', message: `✅ Snippet "${snippet.title}" deleted.` }
  },
}
export default tool
