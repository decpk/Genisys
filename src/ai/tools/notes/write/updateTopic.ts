import { useNoteTopicsStore } from '@/store/note-topics-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_update_topic',
  definition: {
    type: 'function',
    function: {
      name: 'notes_update_topic',
      description: 'Update an existing topic. Can change name, color, or emoji.',
      parameters: {
        type: 'object',
        properties: {
          topicId: { type: 'string', description: 'The topic ID to update' },
          name: { type: 'string', description: 'New name' },
          color: { type: 'string', description: 'New color' },
          emoji: { type: 'string', description: 'New emoji' },
        },
        required: ['topicId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const topicId = args.topicId as string
    if (!topicId) {
      return { kind: 'error', message: 'topicId is required.' }
    }

    const store = useNoteTopicsStore.getState()
    await store.loadTopics()
    const topics = useNoteTopicsStore.getState().topics
    const found = topics.find((t) => t.id === topicId)

    if (!found) {
      return { kind: 'error', message: `Topic "${topicId}" not found.` }
    }

    const updated = { ...found }
    if (args.name !== undefined) updated.name = args.name as string
    if (args.color !== undefined) updated.color = args.color as string
    if (args.emoji !== undefined) updated.emoji = args.emoji as string

    await useNoteTopicsStore.getState().updateTopic(updated)
    return { kind: 'success', message: `✅ Updated topic "${updated.name}" (ID: ${topicId})` }
  },
}

export default tool
