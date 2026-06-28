import { useLibraryStore } from '@/store/library-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'library_toggle_chapter_read',
  definition: {
    type: 'function',
    function: {
      name: 'library_toggle_chapter_read',
      description: 'Mark a chapter as read or unread.',
      parameters: {
        type: 'object',
        properties: {
          chapterId: { type: 'string', description: 'The chapter ID to toggle' },
          isRead: { type: 'boolean', description: 'true to mark as read, false to mark as unread' },
        },
        required: ['chapterId', 'isRead'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const chapterId = args.chapterId as string
    const isRead = args.isRead as boolean
    if (!chapterId || isRead === undefined) {
      return { kind: 'error', message: 'chapterId and isRead are required.' }
    }

    await useLibraryStore.getState().toggleChapterRead(chapterId, isRead)
    return {
      kind: 'success',
      message: `✅ Chapter marked as ${isRead ? 'read' : 'unread'}.`,
    }
  },
}

export default tool
