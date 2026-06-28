import { useCallback, useMemo } from 'react'
import type { MouseEvent } from 'react'

import { useSettingsStore } from '@/store/settings-store'

import type { RepoItem } from '../ProjectExplorer.types'

interface UseExplorerRowOpenHandlersParams {
  item: RepoItem
  onOpenFolder: (path: string) => void
  onOpenFile: (path: string, objectId: string) => void
  onActivePathChange?: (path: string) => void
}

interface ExplorerRowOpenHandlers {
  onClick: (event: MouseEvent<HTMLElement>) => void
  onDoubleClick?: () => void
  /**
   * Cursor utility class for the row. `cursor-pointer` (hand) only when a
   * single click opens the item; otherwise `cursor-default` (arrow) so the
   * row doesn't look like a link when single click merely selects.
   */
  cursorClass: string
}

/**
 * Returns click handlers for an explorer row based on the user's
 * `explorerSingleClickOpen` setting.
 *
 *  - Setting OFF (default): single click selects (sets active path) and
 *    double-click opens — like Finder / Windows Explorer.
 *  - Setting ON: single click selects and opens in one step;
 *    `onDoubleClick` is undefined.
 *
 * Keyboard activation (Enter / Space) is not affected — those handlers
 * always open the item regardless of this setting.
 */
export function useExplorerRowOpenHandlers(
  params: UseExplorerRowOpenHandlersParams
): ExplorerRowOpenHandlers {
  const { item, onOpenFolder, onOpenFile, onActivePathChange } = params
  const singleClickOpen = useSettingsStore((s) => s.explorerSingleClickOpen)

  const open = useCallback(() => {
    if (item.isFolder) onOpenFolder(item.path)
    else onOpenFile(item.path, item.objectId)
  }, [item.isFolder, item.path, item.objectId, onOpenFolder, onOpenFile])

  // WebKit (Tauri on macOS) does not move DOM focus to a <button> on click, so
  // the explorer's keydown listener (attached to the scroll container) never
  // fires after a mouse selection. Explicitly focus the clicked row so arrow-key
  // navigation works immediately after selecting with the mouse.
  const select = useCallback(
    (event?: MouseEvent<HTMLElement>) => {
      event?.currentTarget.focus()
      onActivePathChange?.(item.path)
    },
    [item.path, onActivePathChange]
  )

  const singleClickHandler = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      select(event)
      open()
    },
    [select, open]
  )

  return useMemo<ExplorerRowOpenHandlers>(() => {
    const cursorClass = singleClickOpen ? 'cursor-pointer' : 'cursor-default'
    if (singleClickOpen) {
      return { onClick: singleClickHandler, onDoubleClick: undefined, cursorClass }
    }
    return { onClick: select, onDoubleClick: open, cursorClass }
  }, [singleClickOpen, singleClickHandler, select, open])
}
