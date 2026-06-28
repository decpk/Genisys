import { useCallback } from 'react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('chat')

import { useChatHistoryStore } from '@/store/chat-history-store'
import { useNativeFileDrop, type NativeDroppedFile } from '@/lib/native-file-drop'

interface FileDropState {
  isDragOver: boolean
}

/**
 * Listens to OS file drops on the webview and adds dropped files as sources
 * to the active chat conversation.
 *
 * Migrated from `tauri://drag-drop` events to HTML5 drag-drop after the main
 * window was switched to `dragDropEnabled: false` (required so the Code
 * Review palette can use HTML5 drag-drop — see repo memory
 * `genisys-codereview-palette-drop-tauri-blocker.md`).
 *
 * Skips its handler entirely when another consumer (e.g. the Library
 * "Create New Book" dialog) has claimed exclusive ownership of the next OS
 * drop via `pushDragDropClaim`.
 */
export function useFileDrop(): FileDropState {
  const handleDrop = useCallback(async (files: NativeDroppedFile[]) => {
    const { activeConversationId, addSource } = useChatHistoryStore.getState()
    if (!activeConversationId) return

    let attachedCount = 0
    for (const file of files) {
      if (!file.path) {
        if (import.meta.env.DEV) {
          console.warn(
            '[Chat] dropped file has no path (browser dev or wry without path patch); skipping',
            file.name,
          )
        }
        continue
      }

      let isDir = false
      try {
        const result = await window.api.isDirectory(file.path)
        isDir = result.isDirectory
      } catch {
        // fallback: treat as file
      }

      await addSource({
        sessionId: activeConversationId,
        sourceType: isDir ? 'repo' : 'file',
        path: file.path,
        name: file.name,
      })
      attachedCount += 1
    }

    if (attachedCount > 0) {
      toast.success(
        `Added ${attachedCount} source${attachedCount > 1 ? 's' : ''}`,
      )
    }
  }, [])

  return useNativeFileDrop({ onDrop: handleDrop })
}
