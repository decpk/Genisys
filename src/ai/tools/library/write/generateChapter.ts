import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'library_generate_chapter',
  definition: {
    type: 'function',
    function: {
      name: 'library_generate_chapter',
      description:
        'Generate a single chapter with AI. Note: Chapter generation uses streaming and the useBookGenerator hook, which must run through the UI.',
      parameters: {
        type: 'object',
        properties: {
          bookId: { type: 'string', description: 'The book ID' },
          chapterId: { type: 'string', description: 'The chapter ID to generate content for' },
        },
        required: ['bookId', 'chapterId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const bookId = args.bookId as string
    const chapterId = args.chapterId as string
    if (!bookId || !chapterId) {
      return { kind: 'error', message: 'bookId and chapterId are required.' }
    }

    return {
      kind: 'success',
      message:
        '⚠️ Chapter generation requires the streaming UI pipeline (useBookGenerator hook) and cannot be triggered from the AI assistant. Please use the "Generate" button in the Library UI to start chapter generation.',
    }
  },
}

export default tool
