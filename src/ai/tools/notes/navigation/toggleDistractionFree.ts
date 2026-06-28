import { useNotesAppStore } from '@/store/notes-app-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_toggle_distraction_free',
  definition: {
    type: 'function',
    function: {
      name: 'notes_toggle_distraction_free',
      description: 'Toggle distraction-free mode in the Notes app.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  execute: async (): Promise<ToolResult> => {
    useNotesAppStore.getState().toggleDistractionFree()
    return { kind: 'success', message: '✅ Toggled distraction-free mode' }
  },
}

export default tool
