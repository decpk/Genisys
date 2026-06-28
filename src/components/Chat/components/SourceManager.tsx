import { useState, useCallback, memo } from 'react'
import {
  File,
  FolderOpen,
  FileText,
  Paperclip,
  Type,
  EllipsisVertical,
  ExternalLink,
  Trash2,
} from 'lucide-react'
import { revealItemInDir } from '@tauri-apps/plugin-opener'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

import { PanelHeading } from '@/components/ui/panel-heading'
import { EmptyState } from '@/components/ui/empty-state'
import { Tooltip } from '@/components/Tooltip'
import { useChatHistoryStore, type ChatSource } from '@/store/chat-history-store'

import { RawTextDialog } from './RawTextDialog'
import { useFileDrop } from '../hooks/useFileDrop'

export function SourceManager({ disabled }: { disabled: boolean }): React.JSX.Element {
  const [showRawText, setShowRawText] = useState(false)
  const activeConversationId = useChatHistoryStore((s) => s.activeConversationId)
  const activeSources = useChatHistoryStore((s) => s.activeSources)
  const addSource = useChatHistoryStore((s) => s.addSource)
  const removeSource = useChatHistoryStore((s) => s.removeSource)
  const { isDragOver } = useFileDrop()

  const handleBrowseFiles = useCallback(async () => {
    if (!activeConversationId) return
    const result = await window.api.selectResearchFiles()
    if (!result.success || !result.data) return
    const paths = result.data as string[]
    for (const p of paths) {
      const name = p.split('/').pop() ?? p
      await addSource({ sessionId: activeConversationId, sourceType: 'file', path: p, name })
    }
  }, [activeConversationId, addSource])

  const handleSelectRepo = useCallback(async () => {
    if (!activeConversationId) return
    const result = await window.api.selectLocalRepo()
    if (!result.success || !result.data) return
    const repoPath = result.data as string
    const name = repoPath.split('/').pop() ?? repoPath
    await addSource({ sessionId: activeConversationId, sourceType: 'repo', path: repoPath, name })
  }, [activeConversationId, addSource])

  const handlePasteRaw = useCallback(() => {
    setShowRawText(true)
  }, [])

  const handleRawTextSubmit = useCallback(
    async (name: string, content: string) => {
      if (!activeConversationId) return
      await addSource({ sessionId: activeConversationId, sourceType: 'raw', path: content, name })
      setShowRawText(false)
    },
    [activeConversationId, addSource],
  )

  return (
    <>
      <PanelHeading icon={Paperclip} title="Sources" count={activeSources.length} className="px-3 h-9" />

      {!disabled && (
        <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-2 border-b border-border/40">
          <Tooltip content="Browse Files" side="bottom">
            <button
              onClick={handleBrowseFiles}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-foreground bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
            >
              <File size={12} className="text-muted-foreground" />
              Files
            </button>
          </Tooltip>
          <Tooltip content="Select Repository" side="bottom">
            <button
              onClick={handleSelectRepo}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-foreground bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
            >
              <FolderOpen size={12} className="text-muted-foreground" />
              Repo
            </button>
          </Tooltip>
          <Tooltip content="Paste Raw Text" side="bottom">
            <button
              onClick={handlePasteRaw}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-foreground bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
            >
              <Type size={12} className="text-muted-foreground" />
              Text
            </button>
          </Tooltip>
        </div>
      )}

      <div className="relative flex-1 overflow-y-auto px-2 pb-2 pt-1">
        {isDragOver && !disabled && (
          <div className="absolute inset-2 z-10 rounded-lg border-2 border-dashed border-primary/40 bg-primary/10 pointer-events-none flex items-center justify-center">
            <div className="text-[11px] text-primary font-medium">Drop files here to add as sources</div>
          </div>
        )}
        {disabled ? (
          <EmptyState
            icon={Paperclip}
            message="Create a conversation first"
            className="py-12"
          />
        ) : activeSources.length === 0 ? (
          <EmptyState
            icon={Paperclip}
            message="No sources attached — add files, repos, or paste text"
            className="py-12"
          />
        ) : (
          <div className="space-y-0.5">
            {activeSources.map((source) => (
              <SourceItem key={source.id} source={source} onRemove={() => removeSource(source.id)} />
            ))}
          </div>
        )}
      </div>

      {showRawText && (
        <RawTextDialog
          onSubmit={handleRawTextSubmit}
          onClose={() => setShowRawText(false)}
        />
      )}
    </>
  )
}

const SOURCE_TYPE_ICON = {
  file: File,
  repo: FolderOpen,
  raw: FileText,
} as const

const SOURCE_TYPE_LABEL = {
  file: 'File',
  repo: 'Repository',
  raw: 'Raw Text',
} as const

const SOURCE_TYPE_COLOR = {
  file: 'text-blue-500 bg-blue-500/10',
  repo: 'text-amber-500 bg-amber-500/10',
  raw: 'text-emerald-500 bg-emerald-500/10',
} as const

const SourceItem = memo(function SourceItem({
  source,
  onRemove,
}: {
  source: ChatSource
  onRemove: () => void
}): React.JSX.Element {
  const Icon = SOURCE_TYPE_ICON[source.sourceType]
  const colorClass = SOURCE_TYPE_COLOR[source.sourceType]
  const openSourcePreview = useChatHistoryStore((s) => s.openSourcePreview)

  const handleClick = useCallback(() => {
    openSourcePreview({
      filePath: source.path ?? source.name,
      name: source.name,
      sourceType: source.sourceType,
      content: source.sourceType === 'raw' ? (source.path ?? undefined) : undefined,
    })
  }, [source, openSourcePreview])

  const handleOpenInFinder = useCallback(async () => {
    if (source.path && source.sourceType !== 'raw') {
      await revealItemInDir(source.path)
    }
  }, [source.path, source.sourceType])

  const ext = source.sourceType === 'file'
    ? (source.name.split('.').pop()?.toUpperCase() ?? '')
    : ''

  const canReveal = source.sourceType !== 'raw' && source.path

  return (
    <div
      onClick={handleClick}
      className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-secondary/50 active:scale-[0.98]"
    >
      <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="block truncate text-[12px] font-semibold text-foreground leading-tight">{source.name}</span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] text-muted-foreground/70 font-medium">{SOURCE_TYPE_LABEL[source.sourceType]}</span>
          {ext && (
            <>
              <span className="text-muted-foreground/25 text-[10px]">·</span>
              <span className="text-[10px] text-muted-foreground/50 font-mono">.{ext.toLowerCase()}</span>
            </>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 p-1 rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-secondary/60 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
          >
            <EllipsisVertical size={14} />
          </button>
        </DropdownMenuTrigger>
          <DropdownMenuContent
            side="left"
            align="start"
            sideOffset={4}
            className="z-50 min-w-[160px] rounded-xl border border-border/60 bg-card p-1 shadow-lg animate-in fade-in-0 zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {canReveal && (
              <DropdownMenuItem
                onSelect={handleOpenInFinder}
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-foreground cursor-pointer outline-none hover:bg-secondary/60 focus:bg-secondary/60 transition-colors"
              >
                <ExternalLink size={13} className="text-muted-foreground" />
                Open in Finder
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onSelect={onRemove}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-destructive cursor-pointer outline-none hover:bg-destructive/10 focus:bg-destructive/10 transition-colors"
            >
              <Trash2 size={13} />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
})
