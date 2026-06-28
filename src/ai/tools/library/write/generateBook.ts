import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'library_generate_book',
  definition: {
    type: 'function',
    function: {
      name: 'library_generate_book',
      description:
        'Generate an entire book with AI. Note: Book generation uses streaming and the useBookGenerator hook, which must run through the UI.',
      parameters: {
        type: 'object',
        properties: {
          bookId: { type: 'string', description: 'The book ID to generate content for' },
        },
        required: ['bookId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const bookId = args.bookId as string
    if (!bookId) {
      return { kind: 'error', message: 'bookId is required.' }
    }

    return {
      kind: 'success',
      message:
        '⚠️ Book generation requires the streaming UI pipeline (useBookGenerator hook) and cannot be triggered from the AI assistant. Please use the "Generate" button in the Library UI to start book generation.',
    }
  },
}

export default tool
