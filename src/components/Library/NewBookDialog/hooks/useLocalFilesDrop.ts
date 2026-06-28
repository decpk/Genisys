import { useCallback, useEffect, useRef } from 'react'

import { pushDragDropClaim } from '@/lib/drag-drop-claim'
import { useNativeFileDrop, type NativeDroppedFile } from '@/lib/native-file-drop'

const CLAIM_ID = 'library:new-book-local-files'

interface UseLocalFilesDropArgs {
  /** Whether listeners should be active (e.g. only when LocalMode is open). */
  enabled: boolean
  /** Called with dropped file paths when the drop occurred while the picker is enabled. */
  onFilesDropped: (paths: string[]) => void
}

interface UseLocalFilesDropApi {
  /** True while a native OS drag is hovering over the webview while the picker is enabled. */
  isDragOver: boolean
}

/**
 * Subscribes to OS file drops on the webview and surfaces an `isDragOver`
 * flag plus an `onFilesDropped` callback while the picker is `enabled`.
 *
 * Migrated from `tauri://drag-drop` events to HTML5 drag-drop after the main
 * window was switched to `dragDropEnabled: false` — see repo memory
 * `genisys-codereview-palette-drop-tauri-blocker.md`.
 *
 * Exclusivity is still delegated to the shared `drag-drop-claim` registry:
 * this hook pushes a claim while enabled and other in-app listeners (Chat,
 * ProjectExplorer) skip their handlers when any claim is active.
 */
export function useLocalFilesDrop(args: UseLocalFilesDropArgs): UseLocalFilesDropApi {
  const { enabled, onFilesDropped } = args

  // Pin the latest callback so the hook doesn't tear down on every render.
  const onFilesDroppedRef = useRef(onFilesDropped)
  useEffect(() => {
    onFilesDroppedRef.current = onFilesDropped
  }, [onFilesDropped])

  // Push the claim while enabled so background listeners skip their handlers.
  useEffect(() => {
    if (!enabled) return
    const release = pushDragDropClaim(CLAIM_ID)
    return () => {
      release()
    }
  }, [enabled])

  const handleDrop = useCallback((files: NativeDroppedFile[]) => {
    const paths: string[] = []
    for (const file of files) {
      if (file.path) {
        paths.push(file.path)
      } else if (import.meta.env.DEV) {
        console.warn(
          '[Library/NewBook] dropped file has no path (browser dev or wry without path patch); skipping',
          file.name,
        )
      }
    }
    if (paths.length > 0) onFilesDroppedRef.current(paths)
  }, [])

  // While enabled this hook owns the drop via the claim, so it doesn't
  // ignore claimed drops itself.
  const { isDragOver } = useNativeFileDrop({
    onDrop: handleDrop,
    enabled,
    ignoreWhenClaimed: false,
  })

  return { isDragOver: enabled && isDragOver }
}
