import { useEffect, useRef, useState } from 'react'

import { hasDragDropClaim } from '@/lib/drag-drop-claim'

import { nativeFileFromDataTransfer } from './nativeFileFromDataTransfer'
import type { NativeDroppedFile } from './types'

interface UseNativeFileDropArgs {
  /**
   * Called once per drop, with the resolved list of dropped files. Will not
   * fire when the drop carries no OS files (in-app HTML5 drags carry zero
   * files) or when `enabled === false` or when another consumer has pushed a
   * `drag-drop-claim`.
   */
  onDrop: (files: NativeDroppedFile[]) => void | Promise<void>
  /** When false, all listeners no-op. Defaults to true. */
  enabled?: boolean
  /**
   * When provided, this hook ignores drops while another consumer with this
   * exact claim id is active. Defaults to ignoring whenever any claim is
   * active.
   */
  ignoreWhenClaimed?: boolean
}

interface UseNativeFileDropApi {
  /** True while an OS file is being dragged over the webview. */
  isDragOver: boolean
}

/**
 * Subscribe to OS file drops via the HTML5 drag-and-drop API. This is the
 * replacement for `listen('tauri://drag-drop')` after the main window was
 * switched to `"dragDropEnabled": false` (required so in-app HTML5 drags such
 * as the Code Review palette → canvas can work — see repo memory
 * `genisys-codereview-palette-drop-tauri-blocker.md`).
 *
 * Behaviour notes:
 * - Listeners are attached on `window`. They early-out for in-app drags by
 *   checking `dataTransfer.types` for `'Files'`.
 * - `dragover` always calls `event.preventDefault()` so that drop is allowed.
 *   This is harmless for other in-app drags because xyflow / dnd-kit don't
 *   carry `'Files'` in their dataTransfer types.
 * - Each `File` is mapped to a `NativeDroppedFile` whose `path` is best-effort
 *   (see `nativeFileFromDataTransfer`).
 */
export function useNativeFileDrop(args: UseNativeFileDropArgs): UseNativeFileDropApi {
  const { onDrop, enabled = true, ignoreWhenClaimed = true } = args
  const [isDragOver, setIsDragOver] = useState(false)

  // Pin latest callback so we don't tear down listeners on every render.
  const onDropRef = useRef(onDrop)
  useEffect(() => {
    onDropRef.current = onDrop
  }, [onDrop])

  useEffect(() => {
    if (!enabled) return

    // Counter to debounce dragenter/dragleave across nested elements.
    let dragDepth = 0

    function hasFiles(event: DragEvent): boolean {
      return Boolean(event.dataTransfer?.types?.includes('Files'))
    }

    function onDragEnter(event: DragEvent) {
      if (!hasFiles(event)) return
      if (ignoreWhenClaimed && hasDragDropClaim()) return
      dragDepth += 1
      if (dragDepth === 1) setIsDragOver(true)
    }

    function onDragOver(event: DragEvent) {
      if (!hasFiles(event)) return
      // Required for the drop event to fire.
      event.preventDefault()
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
    }

    function onDragLeave(event: DragEvent) {
      if (!hasFiles(event)) return
      dragDepth = Math.max(0, dragDepth - 1)
      if (dragDepth === 0) setIsDragOver(false)
    }

    async function onDropEvent(event: DragEvent) {
      if (!hasFiles(event)) return
      event.preventDefault()
      dragDepth = 0
      setIsDragOver(false)
      if (ignoreWhenClaimed && hasDragDropClaim()) return
      const list = event.dataTransfer?.files
      if (!list || list.length === 0) return
      const files: NativeDroppedFile[] = []
      for (let i = 0; i < list.length; i += 1) {
        files.push(nativeFileFromDataTransfer(list[i]))
      }
      try {
        await onDropRef.current(files)
      } catch (err) {
        console.error('[useNativeFileDrop] onDrop handler threw', err)
      }
    }

    window.addEventListener('dragenter', onDragEnter)
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('dragleave', onDragLeave)
    window.addEventListener('drop', onDropEvent)
    return () => {
      window.removeEventListener('dragenter', onDragEnter)
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('dragleave', onDragLeave)
      window.removeEventListener('drop', onDropEvent)
    }
  }, [enabled, ignoreWhenClaimed])

  return { isDragOver }
}
