import { useEffect } from 'react'
import type { RefObject } from 'react'

import { getClipboard } from '../components/ExplorerContextMenu/clipboardState'
import { runExplorerPaste } from '../components/ExplorerContextMenu/actions/runExplorerPaste'
import { isTypingInInput } from './useExplorerKeyboardNav/utils/isTypingInInput'

/**
 * The explorer pane the user most recently interacted with (pointer or focus).
 * In split view this lets Cmd+V target the pane the user last touched even when
 * the cursor isn't currently hovering it, while still keeping a single pane
 * eligible so both panes never paste at once.
 */
let lastInteractedPane: HTMLElement | null = null

interface UseExplorerCurrentFolderPasteParams {
  paneRef: RefObject<HTMLElement | null>
  /** Local repos only — paste is a filesystem operation. */
  enabled: boolean
  /** Repo root absolute path (paste destination root). */
  rootPath: string | null | undefined
  /** Folder currently displayed in the pane (paste target). */
  currentPath: string
  /**
   * True when a row is selected/focused. In that case the item-scoped
   * `ExplorerKeyboardOperations` already owns Cmd+V, so this hook stays out of
   * the way to avoid pasting twice.
   */
  hasSelection: boolean
  /** Called after a successful paste so the pane can refresh. */
  onPasted: () => void
}

/**
 * Enables Cmd/Ctrl+V to paste the explorer clipboard into the *current folder*
 * even when no row is selected. Without this, the paste shortcut only worked
 * while a row was focused (because the item-scoped keyboard-operations handler
 * is unmounted otherwise), so users with something on the clipboard saw nothing
 * happen.
 */
export function useExplorerCurrentFolderPaste(
  params: UseExplorerCurrentFolderPasteParams
): void {
  const { paneRef, enabled, rootPath, currentPath, hasSelection, onPasted } = params

  useEffect(() => {
    if (!enabled || !rootPath) return
    // The selected-row path owns Cmd+V; don't double-handle.
    if (hasSelection) return

    const node = paneRef.current
    if (!node) return

    // Remember the last pane the user touched so Cmd+V can target it even when
    // the cursor has since moved away (e.g. to the toolbar or another panel).
    const markInteracted = (): void => {
      lastInteractedPane = node
    }
    node.addEventListener('pointerdown', markInteracted)
    node.addEventListener('focusin', markInteracted)

    const handler = (event: KeyboardEvent) => {
      if (!((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'v')) return
      if (event.shiftKey || event.altKey) return
      if (isTypingInInput(event.target)) return
      const entry = getClipboard()
      if (entry === null) return

      // Only act for the pane the user is actually interacting with so split
      // views don't both paste at once: the hovered/focused pane, or — when
      // neither applies — the pane the user last touched.
      const isHoveredOrFocused =
        node.contains(document.activeElement) || node.matches(':hover')
      if (!isHoveredOrFocused && lastInteractedPane !== node) return

      event.preventDefault()
      event.stopPropagation()

      void runExplorerPaste(rootPath, currentPath).then((success) => {
        if (success) onPasted()
      })
    }

    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      node.removeEventListener('pointerdown', markInteracted)
      node.removeEventListener('focusin', markInteracted)
      if (lastInteractedPane === node) lastInteractedPane = null
    }
  }, [paneRef, enabled, rootPath, currentPath, hasSelection, onPasted])
}
