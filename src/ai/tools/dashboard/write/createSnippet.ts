import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { useSnippetsStore } from '@/store/snippets-store'

const tool: ToolModule = {
  name: 'dashboard_create_snippet',
  definition: {
    type: 'function',
    function: {
      name: 'dashboard_create_snippet',
      description: 'Create a new snippet with a title and content.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Snippet title' },
          content: { type: 'string', description: 'Snippet content' },
          conversationId: { type: 'string', description: 'Optional conversation ID to link the snippet to' },
        },
        required: ['title', 'content'],
      },
    },
  },
  execute: async (args, _ctx): Promise<ToolResult> => {
    const title = args.title as string
    const content = args.content as string
    const conversationId = (args.conversationId as string) || undefined

    await useSnippetsStore.getState().addSnippet(title, content, conversationId)

    return { kind: 'success', message: `✅ Snippet "${title}" created.` }
  },
}
export default tool
