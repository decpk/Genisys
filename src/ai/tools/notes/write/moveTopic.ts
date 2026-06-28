import { useNoteTopicsStore } from '@/store/note-topics-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_move_topic',
  definition: {
    type: 'function',
    function: {
      name: 'notes_move_topic',
      description: 'Move a topic to a different section.',
      parameters: {
        type: 'object',
        properties: {
          topicId: { type: 'string', description: 'The topic ID to move' },
          newSectionId: { type: 'string', description: 'Target section ID' },
        },
        required: ['topicId', 'newSectionId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const topicId = args.topicId as string
    const newSectionId = args.newSectionId as string
    if (!topicId || !newSectionId) {
      return { kind: 'error', message: 'topicId and newSectionId are required.' }
    }

    await useNoteTopicsStore.getState().moveTopic(topicId, newSectionId)
    return { kind: 'success', message: `✅ Moved topic "${topicId}" to section "${newSectionId}"` }
  },
}

export default tool
