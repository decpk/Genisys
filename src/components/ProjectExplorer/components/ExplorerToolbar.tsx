import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Columns2,
  Eye,
  EyeOff,
  FolderOpen,
  FolderMinus,
  HardDrive,
  Pin,
  RefreshCw,
  Sparkles,
  X
} from 'lucide-react'

import { Tooltip } from '@/components/Tooltip'
import { IconButton } from '@/components/ui/icon-button'
import { iconButtonVariants } from '@/components/ui/icon-button'
import { cn } from '@/lib/utils'
import { ExplorerBreadcrumb } from './ExplorerBreadcrumb'
import { ExplorerClipboardIndicator } from './ExplorerClipboardIndicator'
import { ViewModeSwitcher } from './ViewModeSwitcher'
import { ExplorerSortSwitcher } from './ExplorerSortSwitcher'
import type { ViewMode, SortConfig } from './ViewModes/ViewModes.types'

interface ExplorerToolbarProps {
  currentPath: string
  canGoBack: boolean
  canGoForward: boolean
  isLoading: boolean
  onGoBack: () => void
  onGoForward: () => void
  onGoUp: () => void
  canGoUp: boolean
  onNavigate: (path: string) => void
  onRefresh: () => void
  repoName: string
  source: 'local'
  activeMode: ViewMode
  onModeChange: (mode: ViewMode) => void
  sort: SortConfig
  onSortChange: (sort: SortConfig) => void
  showHidden: boolean
  onToggleHidden: () => void
  hideFolders: boolean
  onToggleHideFolders: () => void
  onSplit: () => void
  onClose: () => void
  onOpenAICommand?: () => void
  isPinned: boolean
  onTogglePin: () => void
  /** Repo root absolute path (paste destination root) for the clipboard chip. */
  rootPath?: string | null
  /** Called after a successful paste from the clipboard chip. */
  onPasted?: () => void
}

const NAV_BTN =
  'p-1.5 rounded-[6px] transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-30 text-muted-foreground hover:bg-secondary hover:text-foreground'

export function ExplorerToolbar({
  currentPath,
  canGoBack,
  canGoForward,
  isLoading,
  onGoBack,
  onGoForward,
  onGoUp,
  canGoUp,
  onNavigate,
  onRefresh,
  repoName,
  source,
  activeMode,
  onModeChange,
  sort,
  onSortChange,
  showHidden,
  onToggleHidden,
  hideFolders,
  onToggleHideFolders,
  onSplit,
  onClose,
  onOpenAICommand,
  isPinned,
  onTogglePin,
  rootPath,
  onPasted
}: ExplorerToolbarProps): React.JSX.Element {
  const SourceIcon = HardDrive
  const badgeClass = 'bg-foreground/10 text-foreground border-foreground/20'

  return (
    <div className="flex items-center gap-1 px-3 h-12 border-b border-border/40 shrink-0">
      <Tooltip content="Local repository" side="bottom">
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border mr-1 ${badgeClass}`}
        >
          <SourceIcon size={10} />
          Local
        </span>
      </Tooltip>
      <Tooltip content="Back" side="bottom">
        <IconButton onClick={onGoBack} disabled={!canGoBack} aria-label="Back" size="sm">
          <ArrowLeft size={16} />
        </IconButton>
      </Tooltip>
      <Tooltip content="Forward" side="bottom">
        <IconButton
          onClick={onGoForward}
          disabled={!canGoForward}
          aria-label="Forward"
          size="sm"
        >
          <ArrowRight size={16} />
        </IconButton>
      </Tooltip>
      <Tooltip content="Up one level" side="bottom">
        <IconButton
          onClick={onGoUp}
          disabled={!canGoUp}
          aria-label="Up one level"
          size="sm"
        >
          <ArrowUp size={16} />
        </IconButton>
      </Tooltip>
      <ExplorerBreadcrumb currentPath={currentPath} onNavigate={onNavigate} repoName={repoName} />
      <div className="ml-auto flex items-center gap-3">
        <ExplorerClipboardIndicator
          rootPath={rootPath}
          currentPath={currentPath}
          onPasted={onPasted}
        />
        <ViewModeSwitcher activeMode={activeMode} onModeChange={onModeChange} />
        <div className="w-px h-4 bg-border" />
        <ExplorerSortSwitcher sort={sort} onSortChange={onSortChange} source={source} />
        <div className="w-px h-4 bg-border" />
        {isLocal && (
          <Tooltip content={showHidden ? 'Hide hidden files' : 'Show hidden files'} side="bottom">
            <IconButton
              onClick={onToggleHidden}
              size="sm"
              className={showHidden ? 'text-foreground bg-secondary' : ''}
            >
              {showHidden ? <Eye size={14} /> : <EyeOff size={14} />}
            </IconButton>
          </Tooltip>
        )}
        <Tooltip content={hideFolders ? 'Show folders' : 'Hide folders'} side="bottom">
          <IconButton
            onClick={onToggleHideFolders}
            size="sm"
            className={hideFolders ? 'text-foreground bg-secondary' : ''}
          >
            {hideFolders ? <FolderMinus size={14} /> : <FolderOpen size={14} />}
          </IconButton>
        </Tooltip>
        <div className="w-px h-4 bg-border" />
        {isLocal && onOpenAICommand && (
          <IconButton
            tooltip="AI Command (⌘K)"
            tooltipSide="bottom"
            size="sm"
            onClick={onOpenAICommand}
          >
            <Sparkles size={14} />
          </IconButton>
        )}
        <Tooltip content={isPinned ? 'Unpin from sidebar' : 'Pin to sidebar'} side="bottom">
          <IconButton
            onClick={onTogglePin}
            size="sm"
            aria-pressed={isPinned}
            aria-label={isPinned ? 'Unpin from sidebar' : 'Pin to sidebar'}
            className={isPinned ? 'text-foreground bg-secondary' : ''}
          >
            <Pin
              size={14}
              className={isPinned ? 'fill-current rotate-[-30deg]' : ''}
            />
          </IconButton>
        </Tooltip>
        <IconButton tooltip="Refresh" tooltipSide="bottom" size="sm" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
        </IconButton>
        <IconButton tooltip="Split view" tooltipSide="bottom" size="sm" onClick={onSplit}>
          <Columns2 size={14} />
        </IconButton>
        <IconButton tooltip="Close pane" tooltipSide="bottom" size="sm" onClick={onClose}>
          <X size={14} />
        </IconButton>
      </div>
    </div>
  )
}
