import { Clipboard, ClipboardPaste, Scissors, X } from 'lucide-react'

import { Tooltip } from '@/components/Tooltip'
import { getBaseName } from '../utils/getBaseName'
import { useClipboardState, clearClipboard } from './ExplorerContextMenu/clipboardState'
import { runExplorerPaste } from './ExplorerContextMenu/actions/runExplorerPaste'

interface ExplorerClipboardIndicatorProps {
  /** Repo root absolute path of the pane this toolbar belongs to (paste destination root). */
  rootPath?: string | null
  /** Folder currently displayed in the pane (paste target). */
  currentPath?: string
  /** Called after a successful paste so the pane can refresh. */
  onPasted?: () => void
}

/**
 * Compact toolbar badge that surfaces what is currently on the explorer's
 * internal copy/cut clipboard. Renders nothing when the clipboard is empty.
 *
 * Clicking the badge pastes the item into the pane's current folder; the
 * trailing ✕ clears the clipboard instead. Paste is only wired when the pane
 * provides a local `rootPath` (paste is a filesystem operation).
 */
export function ExplorerClipboardIndicator({
  rootPath,
  currentPath,
  onPasted
}: ExplorerClipboardIndicatorProps = {}): React.JSX.Element | null {
  const entry = useClipboardState()
  if (!entry) return null

  const name = getBaseName(entry.item.path)
  const isCut = entry.mode === 'cut'
  const ModeIcon = isCut ? Scissors : Clipboard
  const label = isCut ? 'Cut' : 'Copied'
  const canPaste = Boolean(rootPath)

  const handlePasteClick = (): void => {
    if (!rootPath) return
    void runExplorerPaste(rootPath, currentPath ?? '/').then((success) => {
      if (success) onPasted?.()
    })
  }

  const handleClear = (event: React.MouseEvent): void => {
    event.stopPropagation()
    clearClipboard()
  }

  return (
    <Tooltip
      content={
        canPaste
          ? `${label}: ${name} — click to paste here`
          : `${label}: ${name} — click ✕ to clear`
      }
      side="bottom"
    >
      <span className="group inline-flex items-center gap-1 max-w-[180px] px-1.5 py-0.5 rounded text-[10px] font-medium border border-primary/30 bg-primary/10 text-primary">
        <button
          type="button"
          onClick={canPaste ? handlePasteClick : undefined}
          disabled={!canPaste}
          aria-label={
            canPaste
              ? `${label} ${name}. Click to paste into current folder.`
              : `${label} ${name}.`
          }
          className="inline-flex items-center gap-1 min-w-0 transition-colors hover:text-primary disabled:cursor-default cursor-pointer"
        >
          <ModeIcon size={10} className="shrink-0" />
          <span className="truncate">{name}</span>
          {canPaste && (
            <ClipboardPaste size={10} className="shrink-0 opacity-60 group-hover:opacity-100" />
          )}
        </button>
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear clipboard"
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <X size={10} />
        </button>
      </span>
    </Tooltip>
  )
}
