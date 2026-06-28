import { useLibraryStore } from '@/store/library-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { resolveActiveChapter } from '@/ai/tools/library/utils/resolveActiveChapter'
import { replaceContentText } from '@/ai/tools/library/utils/replaceContentText'

const tool: ToolModule = {
  name: 'library_replace_chapter_text',
  definition: {
    type: 'function',
    function: {
      name: 'library_replace_chapter_text',
      description:
        'Find and replace a piece of text inside a chapter. Use for small targeted edits. Set all=true to replace every occurrence.',
      parameters: {
        type: 'object',
        properties: {
          chapterId: { type: 'string', description: 'The chapter ID to edit' },
          search: { type: 'string', description: 'The literal text to find' },
          replace: { type: 'string', description: 'The text to replace it with' },
          all: {
            type: 'boolean',
            description: 'Replace every occurrence when true (default false)',
          },
        },
        required: ['chapterId', 'search', 'replace'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const chapterId = args.chapterId as string
    const search = args.search as string
    const replace = args.replace as string
    const all = (args.all as boolean | undefined) ?? false

    const resolved = resolveActiveChapter(chapterId)
    if ('error' in resolved) {
      return { kind: 'error', message: resolved.error }
    }

    const result = replaceContentText(resolved.chapter.content, search, replace, all)
    if ('error' in result) {
      return { kind: 'error', message: result.error }
    }

    await useLibraryStore.getState().updateChapter({ ...resolved.chapter, content: result.content })
    return {
      kind: 'success',
      message: `✅ Replaced ${result.count} occurrence(s) in chapter "${resolved.chapter.title}".`,
    }
  },
}

export default tool
