import { useLibraryStore } from '@/store/library-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'library_update_chapter_status',
  definition: {
    type: 'function',
    function: {
      name: 'library_update_chapter_status',
      description: 'Change the generation status of a chapter.',
      parameters: {
        type: 'object',
        properties: {
          chapterId: { type: 'string', description: 'The chapter ID to update' },
          status: {
            type: 'string',
            enum: ['pending', 'generating', 'completed', 'error'],
            description: 'The new status for the chapter',
          },
          bookId: { type: 'string', description: 'The book ID (optional, uses active book context)' },
        },
        required: ['chapterId', 'status'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const chapterId = args.chapterId as string
    const status = args.status as 'pending' | 'generating' | 'completed' | 'error'
    if (!chapterId || !status) {
      return { kind: 'error', message: 'chapterId and status are required.' }
    }

    const validStatuses = ['pending', 'generating', 'completed', 'error']
    if (!validStatuses.includes(status)) {
      return { kind: 'error', message: `Invalid status "${status}". Must be one of: ${validStatuses.join(', ')}.` }
    }

    const bookId = args.bookId as string | undefined
    await useLibraryStore.getState().updateChapterStatus(chapterId, status, bookId)
    return { kind: 'success', message: `✅ Chapter status updated to "${status}".` }
  },
}

export default tool
