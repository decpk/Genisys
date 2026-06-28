import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowDown,
  Send,
  Sparkles,
  FileText,
  Folder,
  RotateCcw,
  X,
  Plus,
  Trash2,
  ChevronRight,
  MessageSquare,
  Square,
} from 'lucide-react'
import { getFileIcon } from '@/lib/file-icons'
import { ChatEmptyState } from '@/lib/chat-ui'

import { Button } from '@/components/ui/button'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { StreamingIndicator } from '@/components/ui/streaming-indicator'
import { Tooltip } from '@/components/Tooltip'
import { MessageBubble } from '@/right-panels/AIAssistantPanel/MessageBubble'
import { SessionItem } from '@/right-panels/AIAssistantPanel/SessionItem'
import { ToolActivityList } from '@/right-panels/AIAssistantPanel/ToolActivityList'
import { ConfirmationPanel } from '@/right-panels/AIAssistantPanel/ConfirmationPanel'
import { ShellConfirmPanel } from "../ExplorerAICommand/ShellConfirmPanel";
import { useExplorerAICommand } from '../ExplorerAICommand/useExplorerAICommand'
import { cleanupSessionStreams } from '../ExplorerAICommand/explorerAIStreamManager'
import { useExplorerAIHistoryStore, type ExplorerAISession } from '@/store/explorer-ai-history-store'
import { copyToClipboard } from '@/lib/clipboard'
import { ExplorerAIModeSelector } from './ExplorerAIModeSelector'
import type { ExplorerAIMode } from './ExplorerAIMode.constants'
import { mapAgentModeToExplorerMode } from './utils/mapAgentModeToExplorerMode'
import { useSettingsStore } from '@/store/settings-store'
import { ExplorerAIEditor, type ExplorerAIEditorHandle } from './ExplorerAIEditor'
import { stripExplorerConfirmBlocks } from './utils/stripExplorerConfirmBlocks'
import { toAISession } from './utils/toAISession'
import { useRegisterChatSurface } from '@/keyboard-shortcut-impl'
import { PromptPicker, stripPromptTemplate } from '@/components/PromptPicker'

interface ExplorerAIPanelProps {
  rootPath: string
  currentPath: string
  onRefresh: () => void
  droppedFile?: { name: string; path: string; type: string } | null
  onClearDroppedFile?: () => void
}

export function ExplorerAIPanel({
  rootPath,
  currentPath,
  onRefresh,
  droppedFile,
  onClearDroppedFile,
}: ExplorerAIPanelProps): React.JSX.Element {
  const settingsMode = useSettingsStore((s) => s.getAiModeForApp('explorer'))
  const [operationMode, setOperationMode] = useState<ExplorerAIMode>(() => mapAgentModeToExplorerMode(settingsMode))
  const [historyOpen, setHistoryOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<ExplorerAIEditorHandle>(null)
  const isUserScrolledUp = useRef(false)
  const [showScrollButton, setShowScrollButton] = useState(false)

  const fullPath = rootPath + (currentPath && currentPath !== '/' ? currentPath : '')

  // ── Folder stats ──
  const [folderStats, setFolderStats] = useState<{ files: number; folders: number }>({ files: 0, folders: 0 })

  useEffect(() => {
    let cancelled = false
    window.api
      .getLocalRepoItems({ rootPath, path: currentPath || '/', showHidden: false })
      .then((res) => {
        const data = (res as { data?: { isFolder: boolean }[] })?.data
        if (cancelled || !data) return
        let files = 0, folders = 0
        for (const item of data) {
          if (item.isFolder) folders++
          else files++
        }
        setFolderStats({ files, folders })
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [rootPath, currentPath])

  // ── History store ──
  const sessions = useExplorerAIHistoryStore((s) => s.sessions)
  const activeSessionId = useExplorerAIHistoryStore((s) => s.activeSessionId)
  const createSession = useExplorerAIHistoryStore((s) => s.createSession)
  const selectSession = useExplorerAIHistoryStore((s) => s.selectSession)
  const removeSession = useExplorerAIHistoryStore((s) => s.removeSession)
  const clearAll = useExplorerAIHistoryStore((s) => s.clearAll)
  const getActiveSession = useExplorerAIHistoryStore((s) => s.getActiveSession)

  // Filter sessions for current root path
  const relevantSessions = useMemo(
    () => sessions.filter((s) => s.rootPath === rootPath),
    [sessions, rootPath],
  )

  // ── Hook reads active session state directly from the store ──
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
    stopStream,
    resetSession,
  } = useExplorerAICommand(fullPath, onRefresh, operationMode);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    const scrolledUp = distanceFromBottom > 80
    isUserScrolledUp.current = scrolledUp
    setShowScrollButton((prev) => prev !== scrolledUp ? scrolledUp : prev)
  }, [])

  const isStreaming = status === 'thinking' || status === 'executing'

  // Streaming updates: keep following only if user didn't scroll up.
  useLayoutEffect(() => {
    if (!isStreaming || isUserScrolledUp.current) return
    const el = scrollRef.current
    if (!el) return

    el.scrollTop = el.scrollHeight
  }, [isStreaming, streamingContent, toolActivities.length])

  // Non-streaming updates: smooth scroll on finalized content when user stays near bottom.
  useEffect(() => {
    if (isStreaming || isUserScrolledUp.current) return
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, isStreaming])

  useEffect(() => {
    isUserScrolledUp.current = false
    setShowScrollButton(false)
  }, [activeSessionId])

  const handleNewChat = useCallback(() => {
    // If active session is empty, just focus input
    const active = getActiveSession()
    if (active && active.messages.length === 0) {
      editorRef.current?.focus()
      return
    }
    // Check for any existing empty session for this root
    const empty = relevantSessions.find((s) => s.messages.length === 0)
    if (empty) {
      selectSession(empty.id)
      editorRef.current?.focus()
      return
    }
    // Create new session — the old session's stream keeps running in the background
    createSession(rootPath)
    requestAnimationFrame(() => editorRef.current?.focus())
  }, [getActiveSession, relevantSessions, selectSession, createSession, rootPath])

  const handleSelectSession = useCallback(
    (session: ExplorerAISession) => {
      if (session.id === activeSessionId) return
      // Just switch — all state is in the store, background streams keep running
      selectSession(session.id)
    },
    [activeSessionId, selectSession],
  )

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault()
      const text = editorRef.current?.getText() ?? ''
      const trimmed = text.trim()
      if (!trimmed || status === 'thinking' || status === 'executing') return

      const fileMentions = editorRef.current?.getFileMentions() ?? []
      editorRef.current?.clear()

      // Auto-create a session if none exists
      if (!activeSessionId) {
        createSession(rootPath)
      }

      // Build instruction with file context
      let instruction = trimmed
      if (fileMentions.length > 0) {
        instruction = `[Context files: ${fileMentions.join(', ')}]\n\n${instruction}`
      }
      if (droppedFile) {
        instruction = `[Target file: "${droppedFile.name}" at "${droppedFile.path}" (type: ${droppedFile.type})]\n\n${instruction}`
        onClearDroppedFile?.()
      }

      sendInstruction(instruction)
      isUserScrolledUp.current = false
      setShowScrollButton(false)
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
      })
    },
    [status, sendInstruction, droppedFile, onClearDroppedFile, activeSessionId, createSession, rootPath],
  )

  const hasMessages = messages.length > 0 || streamingContent

  // ── Register as a chat surface so Cmd/Ctrl+N triggers "new chat" when focused inside. ──
  useRegisterChatSurface(rootRef, handleNewChat)

  return (
    <div ref={rootRef} className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-12 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-primary" />
          <span className="text-xs font-semibold">AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip content="New chat" side="bottom">
            <button
              onClick={handleNewChat}
              className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
            >
              <Plus size={12} strokeWidth={2.5} />
            </button>
          </Tooltip>
          {hasMessages && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetSession}
              className="h-6 px-1.5 text-[10px] text-muted-foreground bg-secondary/60 hover:bg-secondary"
            >
              <RotateCcw size={10} className="mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* History section */}
      {relevantSessions.length > 0 && (
        <div className="border-b border-border/30 shrink-0">
          <button
            onClick={() => setHistoryOpen((v) => !v)}
            className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors cursor-pointer"
          >
            <ChevronRight
              size={10}
              className={`transition-transform duration-200 ${historyOpen ? "rotate-90" : ""}`}
            />
            <MessageSquare size={10} />
            <span className="font-medium">History</span>
            <span className="text-muted-foreground/50 tabular-nums">
              {relevantSessions.length}
            </span>
            {relevantSessions.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Clean up all background streams before clearing
                  for (const s of relevantSessions) {
                    cleanupSessionStreams(s.id);
                  }
                  clearAll();
                }}
                className="ml-auto p-0.5 rounded hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
              >
                <Trash2 size={10} />
              </button>
            )}
          </button>
          {historyOpen && (
            <div className="max-h-[140px] overflow-y-auto px-1.5 pb-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
              {relevantSessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={toAISession(session)}
                  isActive={session.id === activeSessionId}
                  onSelect={() => handleSelectSession(session)}
                  onRemove={() => {
                    cleanupSessionStreams(session.id);
                    removeSession(session.id);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-3 min-h-0"
      >
        {!hasMessages && status === "idle" && (
          <ChatEmptyState
            title="Ask AI to manage files in the current folder"
            suggestions={[
              '"List all TypeScript files"',
              '"Delete all .log files"',
              '"Create a new folder called utils"',
            ]}
            onSuggestionClick={(text) => {
              editorRef.current?.setText(text);
              requestAnimationFrame(() => handleSubmit());
            }}
          />
        )}

        {messages.map((msg, idx) => (
          <MessageBubble
            key={msg.id}
            message={
              msg.role === "assistant"
                ? { ...msg, content: stripExplorerConfirmBlocks(msg.content) }
                : msg
            }
            showSeparator={msg.role === "user" && idx > 0}
          />
        ))}

        {/* Tool activities */}
        {toolActivities.length > 0 && (
          <ToolActivityList activities={toolActivities} />
        )}

        {/* Streaming content */}
        {streamingContent && (
          <div className="mt-2 text-xs">
            <MarkdownRenderer content={streamingContent} isStreaming />
          </div>
        )}

        {/* Streaming indicator */}
        {isStreaming && !streamingContent && (
          <div className="mt-2 text-xs">
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
          <div className="mt-2 p-2 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs">
            <div className="flex items-center gap-1.5 font-medium">
              <AlertTriangle size={12} />
              Error
            </div>
            <p className="mt-1 text-[10px]">{error}</p>
          </div>
        )}
      </div>

      {/* Follow output button */}
      {showScrollButton && isStreaming && (
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => {
              isUserScrolledUp.current = false;
              setShowScrollButton(false);
              scrollRef.current?.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
              });
            }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-medium shadow-md hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <ArrowDown size={10} />
            Follow output
          </button>
        </div>
      )}

      {/* Current path context */}
      <div className="px-3 py-1.5 border-t border-border/30 shrink-0 space-y-0.5">
        <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/50">
          Current Folder Properties
        </span>
        <button
          type="button"
          onClick={() =>
            copyToClipboard(fullPath.split("/").pop() || fullPath, "Name")
          }
          className="flex items-center gap-1.5 w-full text-left rounded-md px-1.5 py-0.5 -mx-1.5 hover:bg-secondary/60 active:bg-secondary/80 transition-colors cursor-pointer group"
          title="Click to copy name"
        >
          <Folder size={10} className="text-primary/70 shrink-0" />
          <span className="text-[10px] font-medium text-foreground/80 truncate group-hover:text-foreground transition-colors">
            {fullPath.split("/").pop() || fullPath}
          </span>
        </button>
        <button
          type="button"
          onClick={() => copyToClipboard(fullPath, "Path")}
          className="flex items-center gap-2 w-full text-left rounded-md px-1.5 py-0.5 -mx-1.5 pl-[22px] hover:bg-secondary/60 active:bg-secondary/80 transition-colors cursor-pointer group"
          title="Click to copy path"
        >
          <span className="text-[9px] text-muted-foreground/50 truncate group-hover:text-muted-foreground/70 transition-colors">
            {fullPath}
          </span>
        </button>
        {folderStats && (folderStats.files > 0 || folderStats.folders > 0) && (
          <div className="flex items-center gap-1.5 pl-[16px]">
            <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground/60">
              <Folder size={8} className="text-primary/50" />
              {folderStats.folders}{" "}
              {folderStats.folders === 1 ? "folder" : "folders"}
            </span>
            <span className="text-[9px] text-muted-foreground/30">
              &middot;
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground/60">
              <FileText size={8} className="text-primary/50" />
              {folderStats.files} {folderStats.files === 1 ? "file" : "files"}
            </span>
          </div>
        )}
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="px-3 py-2 shrink-0">
        {droppedFile && (
          <div className="flex items-center gap-1.5 mb-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-xs">
            <span className="shrink-0">
              {getFileIcon(droppedFile.name, droppedFile.type === "folder", 12)}
            </span>
            <span className="truncate flex-1 font-medium text-foreground">
              {droppedFile.name}
            </span>
            <span className="text-[10px] text-muted-foreground shrink-0">
              {droppedFile.type}
            </span>
            <button
              type="button"
              onClick={onClearDroppedFile}
              className="p-0.5 rounded hover:bg-primary/20 transition-colors cursor-pointer text-muted-foreground hover:text-foreground shrink-0"
            >
              <X size={10} />
            </button>
          </div>
        )}
        <div className="flex items-center gap-1 rounded-lg border border-border/40 bg-secondary/50 px-1 py-0.5">
          <ExplorerAIModeSelector
            selectedMode={operationMode}
            onModeChange={setOperationMode}
          />
          <div className="w-px h-4 bg-border/40 shrink-0" />
          <PromptPicker
            appId="explorer"
            onSelect={(prompt) => {
              const text = stripPromptTemplate(prompt.content);
              if (!text) return;
              editorRef.current?.insertContent(text);
            }}
          />
          <div className="w-px h-4 bg-border/40 shrink-0" />
          <ExplorerAIEditor
            ref={editorRef}
            rootPath={rootPath}
            currentPath={currentPath}
            onSubmit={() => handleSubmit()}
            isDisabled={isStreaming}
            placeholder={
              status === "awaiting-confirmation"
                ? "Confirm or cancel above..."
                : "Type instruction… (@ for files)"
            }
          />
          <Button
            type={isStreaming ? "button" : "submit"}
            size="sm"
            onClick={isStreaming ? stopStream : undefined}
            variant={isStreaming ? "destructive" : "default"}
            title={isStreaming ? "Stop generating" : "Send"}
            aria-label={isStreaming ? "Stop generating" : "Send message"}
            className="h-6 w-6 p-0 shrink-0"
          >
            {isStreaming ? <Square size={11} /> : <Send size={11} />}
          </Button>
        </div>
      </form>
    </div>
  );
}
