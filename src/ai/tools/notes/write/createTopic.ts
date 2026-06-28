import { useNoteTopicsStore } from '@/store/note-topics-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_create_topic',
  definition: {
    type: 'function',
    function: {
      name: 'notes_create_topic',
      description: 'Create a new topic within a section.',
      parameters: {
        type: 'object',
        properties: {
          sectionId: { type: 'string', description: 'Parent section ID' },
          name: { type: 'string', description: 'Topic name' },
          color: { type: 'string', description: 'Topic color' },
        },
        required: ['sectionId', 'name'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const sectionId = args.sectionId as string
    const name = args.name as string
    if (!sectionId || !name?.trim()) {
      return { kind: 'error', message: 'sectionId and name are required.' }
    }

    const topic = await useNoteTopicsStore.getState().addTopic(sectionId, name, args.color as string | undefined)
    return { kind: 'success', message: `✅ Created topic "${name}" (ID: ${topic.id}) in section ${sectionId}` }
  },
}

export default tool
