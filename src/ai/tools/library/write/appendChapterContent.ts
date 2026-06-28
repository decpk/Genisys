import { useLibraryStore } from '@/store/library-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { resolveActiveChapter } from '@/ai/tools/library/utils/resolveActiveChapter'
import { appendContentToChapter } from '@/ai/tools/library/utils/appendContentToChapter'

const tool: ToolModule = {
  name: 'library_append_chapter_content',
  definition: {
    type: 'function',
    function: {
      name: 'library_append_chapter_content',
      description: 'Append new markdown content to the end of a chapter.',
      parameters: {
        type: 'object',
        properties: {
          chapterId: { type: 'string', description: 'The chapter ID to append content to' },
          text: { type: 'string', description: 'The markdown content to append' },
        },
        required: ['chapterId', 'text'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const chapterId = args.chapterId as string
    const text = args.text as string

    const resolved = resolveActiveChapter(chapterId)
    if ('error' in resolved) {
      return { kind: 'error', message: resolved.error }
    }

    const newContent = appendContentToChapter(resolved.chapter.content, text)
    await useLibraryStore.getState().updateChapter({ ...resolved.chapter, content: newContent })
    return { kind: 'success', message: `✅ Appended content to chapter "${resolved.chapter.title}".` }
  },
}

export default tool
