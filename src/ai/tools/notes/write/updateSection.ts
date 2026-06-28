import { useNoteSectionsStore } from '@/store/note-sections-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_update_section',
  definition: {
    type: 'function',
    function: {
      name: 'notes_update_section',
      description: 'Update an existing section. Can change name, color, or emoji.',
      parameters: {
        type: 'object',
        properties: {
          sectionId: { type: 'string', description: 'The section ID to update' },
          name: { type: 'string', description: 'New name' },
          color: { type: 'string', description: 'New color' },
          emoji: { type: 'string', description: 'New emoji' },
        },
        required: ['sectionId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const sectionId = args.sectionId as string
    if (!sectionId) {
      return { kind: 'error', message: 'sectionId is required.' }
    }

    const store = useNoteSectionsStore.getState()
    await store.loadSections()
    const sections = useNoteSectionsStore.getState().sections
    const found = sections.find((s) => s.id === sectionId)

    if (!found) {
      return { kind: 'error', message: `Section "${sectionId}" not found.` }
    }

    const updated = { ...found }
    if (args.name !== undefined) updated.name = args.name as string
    if (args.color !== undefined) updated.color = args.color as string
    if (args.emoji !== undefined) updated.emoji = args.emoji as string

    await useNoteSectionsStore.getState().updateSection(updated)
    return { kind: 'success', message: `✅ Updated section "${updated.name}" (ID: ${sectionId})` }
  },
}

export default tool
