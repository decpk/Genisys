import { useWebLinksStore } from '@/store/weblinks-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'previewer_list_folders',
  definition: {
    type: 'function',
    function: {
      name: 'previewer_list_folders',
      description:
        'List all preview folders with their id, name, and number of saved previews in each. Also reports the count of unfiled previews.',
      parameters: { type: 'object', properties: {} },
    },
  },
  execute: async (): Promise<ToolResult> => {
    const { folders, previews } = useWebLinksStore.getState()

    const unfiledCount = previews.filter((p) => p.folderId === null).length

    if (folders.length === 0) {
      return {
        kind: 'success',
        message: `No folders yet. Unfiled previews: ${unfiledCount}.`,
      }
    }

    const lines = folders.map((f) => {
      const count = previews.filter((p) => p.folderId === f.id).length
      return `| ${f.id} | ${f.name} | ${count} |`
    })

    const message = [
      `**Folders (${folders.length})**`,
      '',
      '| id | name | previews |',
      '| --- | --- | --- |',
      ...lines,
      '',
      `_Unfiled previews: ${unfiledCount}_`,
    ].join('\n')

    return { kind: 'success', message }
  },
}

export default tool
