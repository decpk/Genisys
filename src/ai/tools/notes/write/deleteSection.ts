import { useNoteSectionsStore } from '@/store/note-sections-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_delete_section',
  definition: {
    type: 'function',
    function: {
      name: 'notes_delete_section',
      description: 'Delete a section. This action requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          sectionId: { type: 'string', description: 'The section ID to delete' },
        },
        required: ['sectionId'],
      },
    },
  },
  execute: async (args, ctx): Promise<ToolResult> => {
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

    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'notes_delete_section',
          description: `Delete section: "${found.name}"`,
          items: [{ path: sectionId, type: 'note', details: found.name }],
          warning: 'This will delete the section and may affect notes and topics within it.',
        },
        executeAfterConfirm: async () => {
          await useNoteSectionsStore.getState().removeSection(sectionId)
          return `✅ Deleted section "${found.name}"`
        },
      }
    }

    await useNoteSectionsStore.getState().removeSection(sectionId)
    return { kind: 'success', message: `✅ Deleted section "${found.name}"` }
  },
}

export default tool
