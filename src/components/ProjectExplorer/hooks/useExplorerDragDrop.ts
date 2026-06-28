import { useCallback, useState } from 'react'

import { useNativeFileDrop, type NativeDroppedFile } from '@/lib/native-file-drop'

/**
 * Migrated from `tauri://drag-drop` events to HTML5 drag-drop after the main
 * window was switched to `dragDropEnabled: false` — see repo memory
 * `genisys-codereview-palette-drop-tauri-blocker.md`.
 */
export function useExplorerDragDrop(openAIPanel: (open: boolean) => void) {
  const [droppedFile, setDroppedFile] = useState<{ name: string; path: string; type: string } | null>(null)

  const handleDrop = useCallback(
    async (files: NativeDroppedFile[]) => {
      if (files.length === 0) return
      const file = files[0]
      if (!file.path) {
        if (import.meta.env.DEV) {
          console.warn(
            '[ProjectExplorer] dropped file has no path (browser dev or wry without path patch); ignoring',
            file.name,
          )
        }
        return
      }

      const ext = file.name.includes('.') ? file.name.split('.').pop()! : ''
      let isDir = false
      try {
        const result = await window.api.isDirectory(file.path)
        isDir = result.isDirectory
      } catch {
        // fallback: treat as file
      }

      setDroppedFile({
        name: file.name,
        path: file.path,
        type: isDir ? 'folder' : ext || 'file',
      })

      openAIPanel(true)
    },
    [openAIPanel],
  )

  const { isDragOver } = useNativeFileDrop({ onDrop: handleDrop })

  return { droppedFile, setDroppedFile, isDragOver }
}
