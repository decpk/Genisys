import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { useSnippetsStore } from '@/store/snippets-store'

const tool: ToolModule = {
  name: 'dashboard_update_snippet',
  definition: {
    type: 'function',
    function: {
      name: 'dashboard_update_snippet',
      description: 'Update the title or content of an existing snippet.',
      parameters: {
        type: 'object',
        properties: {
          snippetId: { type: 'string', description: 'ID of the snippet to update' },
          title: { type: 'string', description: 'New title' },
          content: { type: 'string', description: 'New content' },
        },
        required: ['snippetId'],
      },
    },
  },
  execute: async (args, _ctx): Promise<ToolResult> => {
    const snippetId = args.snippetId as string
    const title = args.title as string | undefined
    const content = args.content as string | undefined

    const store = useSnippetsStore.getState()
    const snippet = store.snippets.find((s) => s.id === snippetId)
    if (!snippet) {
      return { kind: 'error', message: `Snippet "${snippetId}" not found.` }
    }

    const updates: Record<string, string> = {}
    if (title) updates.title = title
    if (content) updates.content = content

    if (Object.keys(updates).length === 0) {
      return { kind: 'error', message: 'No updates provided. Specify at least title or content.' }
    }

    await store.updateSnippet(snippetId, updates)
    return { kind: 'success', message: `✅ Snippet "${snippet.title}" updated.` }
  },
}
export default tool
