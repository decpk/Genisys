import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Send,
  Sparkles,
  X,
  RotateCcw,
} from 'lucide-react'
import { getFileIcon } from '@/lib/file-icons'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AppLoaderGlyph } from '@/components/AppLoader'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { StreamingIndicator } from '@/components/ui/streaming-indicator'
import { useExplorerAICommand } from './useExplorerAICommand'
import { useExplorerAIHistoryStore } from '@/store/explorer-ai-history-store'
import { ShellConfirmPanel } from "./ShellConfirmPanel";
import type { ExplorerAIMessage, ExplorerConfirmAction, ToolActivity } from './ExplorerAICommand.types'

interface ExplorerAICommandProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rootPath: string
  onRefresh: () => void
}

export function ExplorerAICommand({
  open,
  onOpenChange,
  rootPath,
  onRefresh,
}: ExplorerAICommandProps): React.JSX.Element {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    status,
    messages,
    streamingContent,
    pendingConfirm,
    pendingShellConfirm,
    toolActivities,
    error,
    sendInstruction,
    confirmAction,
    cancelAction,
    respondShell,
    resetSession,
  } = useExplorerAICommand(rootPath, onRefresh);

  const activeSessionId = useExplorerAIHistoryStore((s) => s.activeSessionId)
  const createSession = useExplorerAIHistoryStore((s) => s.createSession)

  // Ensure a session exists when the modal opens
  useEffect(() => {
    if (open && !activeSessionId) {
      createSession(rootPath)
    }
  }, [open, activeSessionId, createSession, rootPath])

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, streamingContent, toolActivities])

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault()
      const trimmed = input.trim()
      if (!trimmed || status === 'thinking' || status === 'executing') return
      setInput('')
      sendInstruction(trimmed)
    },
    [input, status, sendInstruction]
  )

  const handleClose = useCallback(() => {
    onOpenChange(false)
    // Defer reset so dialog animate-out completes
    setTimeout(resetSession, 300)
  }, [onOpenChange, resetSession])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  const isStreaming = status === 'thinking' || status === 'executing'
  const hasMessages = messages.length > 0 || streamingContent

  // Shorten root path for display
  const displayPath =
    rootPath.length > 50
      ? '...' + rootPath.slice(rootPath.length - 47)
      : rootPath

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[700px] w-[90vw] max-h-[80vh] flex flex-col p-0 gap-0"
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className="px-5 py-4 border-b border-border/30 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              <DialogTitle className="text-base font-semibold">
                AI Command
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              {hasMessages && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetSession}
                  className="h-7 px-2 text-xs text-muted-foreground"
                >
                  <RotateCcw size={12} className="mr-1" />
                  Reset
                </Button>
              )}
              <button
                onClick={handleClose}
                className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {displayPath}
          </p>
        </DialogHeader>

        {/* Messages area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-5 py-4 min-h-[200px] max-h-[50vh]"
        >
          {!hasMessages && status === "idle" && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
              <Sparkles size={32} className="text-muted-foreground/40" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Type a natural language instruction to manage files
                </p>
                <div className="mt-3 flex flex-col gap-1.5 text-xs text-muted-foreground/70">
                  <p>"List all TypeScript files larger than 100KB"</p>
                  <p>"Delete all .log files"</p>
                  <p>"Create a new folder called components"</p>
                  <p>"Rename config.json to config.backup.json"</p>
                </div>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Tool activities */}
          {toolActivities.length > 0 && (
            <ToolActivityList activities={toolActivities} />
          )}

          {/* Streaming content */}
          {streamingContent && (
            <div className="mt-3 text-sm">
              <MarkdownRenderer content={streamingContent} />
            </div>
          )}

          {/* Streaming indicator */}
          {isStreaming && !streamingContent && (
            <div className="mt-3 text-sm">
              <StreamingIndicator
                label={status === "thinking" ? "Analyzing..." : "Executing..."}
              />
            </div>
          )}

          {/* Confirmation UI */}
          {pendingConfirm && (
            <ConfirmationPanel
              confirm={pendingConfirm}
              onConfirm={confirmAction}
              onCancel={cancelAction}
            />
          )}

          {/* Shell command approval */}
          {pendingShellConfirm && (
            <ShellConfirmPanel
              confirm={pendingShellConfirm}
              onApprove={() => respondShell(true)}
              onDeny={() => respondShell(false)}
            />
          )}

          {/* Error */}
          {error && (
            <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              <div className="flex items-center gap-2 font-medium">
                <AlertTriangle size={14} />
                Error
              </div>
              <p className="mt-1 text-xs">{error}</p>
            </div>
          )}
        </div>

        {/* Input area */}
        <form
          onSubmit={handleSubmit}
          className="px-5 py-3 border-t border-border/30 shrink-0"
        >
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                status === "awaiting-confirmation"
                  ? "Confirm or cancel the pending action above..."
                  : "Type your instruction..."
              }
              disabled={isStreaming}
              className="flex-1 bg-secondary/50 border border-transparent rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-input focus:ring-1 focus:ring-ring/20 disabled:opacity-50"
              autoComplete="off"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || isStreaming}
              className="h-9 px-3"
            >
              <Send size={14} />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function MessageBubble({ message }: { message: ExplorerAIMessage }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-3">
        <div className="max-w-[85%] bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 text-sm">
          {message.content}
        </div>
      </div>
    )
  }

  // Strip out explorer-confirm blocks for display
  const displayContent = message.content
    .replace(/```explorer-confirm\n[\s\S]*?\n```/g, '')
    .trim()

  if (!displayContent) return null

  return (
    <div className="mb-3">
      <div className="text-sm prose-sm">
        <MarkdownRenderer content={displayContent} />
      </div>
    </div>
  )
}

function ToolActivityList({ activities }: { activities: ToolActivity[] }) {
  const TOOL_LABELS: Record<string, string> = {
    list_directory: "List directory",
    read_file: "Read file",
    find_files: "Find files",
    grep_search: "Search text",
    get_disk_usage: "Disk usage",
    get_file_info: "File info",
    git_status: "Git status",
    git_log: "Git log",
    git_diff: "Git diff",
    git_show_commit: "Git show commit",
    git_branches: "Git branches",
    create_file: "Create file",
    create_folder: "Create folder",
    delete_item: "Delete item",
    rename_item: "Rename item",
    move_item: "Move item",
    copy_item: "Copy item",
    run_shell_command: "Run command",
  };

  return (
    <div className="mt-2 mb-2 space-y-1">
      {activities.map((activity, i) => (
        <div
          key={`${activity.toolName}-${i}`}
          className="flex items-center gap-2 text-xs text-muted-foreground py-0.5"
        >
          {activity.status === 'running' ? (
            <AppLoaderGlyph size={12} className="text-primary" />
          ) : (
            <CheckCircle2 size={12} className="text-green-500" />
          )}
          <span className="font-mono">{TOOL_LABELS[activity.toolName] ?? activity.toolName}</span>
          {activity.args &&
            Object.keys(activity.args).length > 0 && (
              <span className="truncate max-w-[300px] opacity-60">
                {Object.values(activity.args).join(', ')}
              </span>
            )}
        </div>
      ))}
    </div>
  )
}

function ConfirmationPanel({
  confirm,
  onConfirm,
  onCancel,
}: {
  confirm: ExplorerConfirmAction
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="mt-4 rounded-lg border-2 border-amber-500/40 bg-amber-500/5 overflow-hidden">
      {/* Warning header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20">
        <AlertTriangle size={16} className="text-amber-500 shrink-0" />
        <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
          Confirmation Required
        </span>
      </div>

      {/* Description */}
      <div className="px-4 py-3">
        <p className="text-sm font-medium mb-2">{confirm.description}</p>

        {/* Affected items */}
        {confirm.items.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {confirm.items.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 rounded px-2.5 py-1.5"
              >
                <span className="shrink-0">
                  {getFileIcon(
                    item.path.split("/").pop() ?? item.path,
                    item.type === "folder",
                    14,
                  )}
                </span>
                <span className="text-xs flex-1 truncate">{item.path}</span>
                {item.size && (
                  <span className="text-xs opacity-60">{item.size}</span>
                )}
                {item.details && (
                  <span className="text-xs opacity-60">({item.details})</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Warning text */}
        <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
          {confirm.warning}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-amber-500/20 bg-amber-500/5">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onConfirm}
          className="gap-1"
        >
          <AlertTriangle size={12} />
          Confirm & Execute
        </Button>
      </div>
    </div>
  );
}
