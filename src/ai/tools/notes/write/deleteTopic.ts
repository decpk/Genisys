import { useNoteTopicsStore } from '@/store/note-topics-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_delete_topic',
  definition: {
    type: 'function',
    function: {
      name: 'notes_delete_topic',
      description: 'Delete a topic. This action requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          topicId: { type: 'string', description: 'The topic ID to delete' },
        },
        required: ['topicId'],
      },
    },
  },
  execute: async (args, ctx): Promise<ToolResult> => {
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

    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'notes_delete_topic',
          description: `Delete topic: "${found.name}"`,
          items: [{ path: topicId, type: 'note', details: found.name }],
          warning: 'This will delete the topic and may affect notes assigned to it.',
        },
        executeAfterConfirm: async () => {
          await useNoteTopicsStore.getState().removeTopic(topicId)
          return `✅ Deleted topic "${found.name}"`
        },
      }
    }

    await useNoteTopicsStore.getState().removeTopic(topicId)
    return { kind: 'success', message: `✅ Deleted topic "${found.name}"` }
  },
}

export default tool
