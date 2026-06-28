import { useLibraryStore } from '@/store/library-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'library_get_current_context',
  definition: {
    type: 'function',
    function: {
      name: 'library_get_current_context',
      description:
        'Get the current library state including active book, active chapter, reading progress, and distraction-free mode status.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  execute: async (): Promise<ToolResult> => {
    const state = useLibraryStore.getState()

    const parts: string[] = []
    parts.push(`- **Books loaded:** ${state.isLoaded ? 'yes' : 'no'}`)
    parts.push(`- **Total books:** ${state.books.length}`)
    parts.push(`- **Active book ID:** ${state.activeBookId || '(none)'}`)
    parts.push(`- **Active chapter ID:** ${state.activeChapterId || '(none)'}`)
    parts.push(`- **Loading book:** ${state.isLoadingBook ? 'yes' : 'no'}`)
    parts.push(`- **Distraction-free:** ${state.distractionFree ? 'on' : 'off'}`)

    if (state.activeBook) {
      const { book, chapters } = state.activeBook
      const readCount = chapters.filter((c) => c.isRead).length
      const totalChapters = chapters.length
      const progress = totalChapters > 0 ? Math.round((readCount / totalChapters) * 100) : 0
      parts.push('')
      parts.push(`**Active Book:** ${book.title}`)
      parts.push(`- **Status:** ${book.status}`)
      parts.push(`- **Reading progress:** ${readCount}/${totalChapters} chapters read (${progress}%)`)

      if (state.activeChapterId) {
        const chapter = chapters.find((c) => c.id === state.activeChapterId)
        if (chapter) {
          parts.push(`- **Active chapter:** Ch.${chapter.chapterNumber} — ${chapter.title} (${chapter.status}, ${chapter.isRead ? 'read' : 'unread'})`)
        }
      }
    }

    return { kind: 'success', message: parts.join('\n') }
  },
}

export default tool
