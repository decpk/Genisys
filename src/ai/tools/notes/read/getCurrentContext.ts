import { useNotesAppStore } from '@/store/notes-app-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_get_current_context',
  definition: {
    type: 'function',
    function: {
      name: 'notes_get_current_context',
      description: 'Get the current Notes app UI state including selected note, notebook, sidebar view, filter, and distraction-free mode.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  execute: async (): Promise<ToolResult> => {
    const state = useNotesAppStore.getState()

    return {
      kind: 'success',
      message: [
        `**Current Notes Context**`,
        `- Selected Note: ${state.selectedNoteId || 'none'}`,
        `- Selected Notebook: ${state.selectedNotebookId || 'none'}`,
        `- Selected Section: ${state.selectedSectionId || 'none'}`,
        `- Selected Topic: ${state.selectedTopicId || 'none'}`,
        `- Selected Label: ${state.selectedLabelId || 'none'}`,
        `- Sidebar View: ${state.sidebarView}`,
        `- Sidebar Filter: ${state.sidebarFilter}`,
        `- Sidebar Sort: ${state.sidebarSort}`,
        `- Search Query: ${state.searchQuery || 'none'}`,
        `- Distraction-Free: ${state.distractionFree}`,
      ].join('\n'),
    }
  },
}

export default tool
