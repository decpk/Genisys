import { useLibraryStore } from '@/store/library-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'library_toggle_distraction_free',
  definition: {
    type: 'function',
    function: {
      name: 'library_toggle_distraction_free',
      description: 'Toggle distraction-free reading mode on or off.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  execute: async (): Promise<ToolResult> => {
    useLibraryStore.getState().toggleDistractionFree()
    const isOn = useLibraryStore.getState().distractionFree
    return {
      kind: 'success',
      message: `✅ Distraction-free mode ${isOn ? 'enabled' : 'disabled'}.`,
    }
  },
}

export default tool
