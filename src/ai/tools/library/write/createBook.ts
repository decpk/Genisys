import { useLibraryStore } from '@/store/library-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'library_create_book',
  definition: {
    type: 'function',
    function: {
      name: 'library_create_book',
      description: 'Create a new book in the library.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'The title of the book' },
          description: { type: 'string', description: 'A short description of the book' },
          model: { type: 'string', description: 'The AI model to use for generation' },
        },
        required: ['title'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const title = args.title as string
    if (!title) {
      return { kind: 'error', message: 'title is required.' }
    }

    const description = (args.description as string) || undefined
    const model = (args.model as string) || undefined

    const book = await useLibraryStore.getState().createBook(title, description, model)
    return {
      kind: 'success',
      message: `✅ Book "${book.title}" created (ID: ${book.id}).`,
    }
  },
}

export default tool
