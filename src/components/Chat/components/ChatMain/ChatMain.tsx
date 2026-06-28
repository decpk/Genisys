import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Copy, ChevronDown, ArrowUp, ArrowDown, MessageSquare } from 'lucide-react'
import { AppLoaderGlyph } from '@/components/AppLoader'
import { MainEmptyState } from '@/components/ui/main-empty-state'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { VscGithub } from 'react-icons/vsc'

import { useChatHistoryStore } from '@/store/chat-history-store'
import { useSettingsStore } from '@/store/settings-store'
import { Tooltip } from '@/components/Tooltip'
import { Dropdown } from "@/components/ui/dropdown";
import { ChatEmptyState, ChatSurfaceHeader } from '@/lib/chat-ui'

import { useReportAppBusy } from '@/components/GenisysApp/app-activity-registry'

import { useChatStream } from '../../hooks'
import { useFileDrop } from '../../hooks/useFileDrop'
import { ChatMessageBubble } from '../ChatMessageBubble'
import { ChatInput } from '../ChatInput'
import { SelectionToolbar } from '../SelectionToolbar'
import { SourcePreviewModal } from '../SourcePreviewModal'
import { RawTextDialog } from '../RawTextDialog'
import { CHAT_WIDTH_OPTIONS } from '../../Chat.constants'
import type { AIActionId } from '../AIActionBlock'

const CHAT_WELCOME_SUGGESTIONS = [
  'Explain a concept I’m stuck on',
  'Summarize a long document',
  'Draft an email or message',
  'Plan a project step by step',
]

export function ChatMain(): React.JSX.Element {
  return <ChatConversationView />
}

function ChatConversationView(): React.JSX.Element {
  const activeMessages = useChatHistoryStore((s) => s.activeMessages)
  const hasMoreMessages = useChatHistoryStore((s) => s.hasMoreMessages)
  const isLoadingMessages = useChatHistoryStore((s) => s.isLoadingMessages)
  const loadMoreMessages = useChatHistoryStore((s) => s.loadMoreMessages)
  const createConversation = useChatHistoryStore((s) => s.createConversation)
  const { isStreaming, streamingContent, error, toolCalls, preToolContent, crawlNavLinks, sendMessage, stopStream, primeAutoApproveNextRun } = useChatStream()
  // Protect the Chat app from keep-alive eviction while a response is
  // streaming. `isStreaming` is component-local React state owned by
  // `useChatStream()` (not a store), so we report it from here — the place
  // that owns the signal — per the app-activity-registry contract.
  useReportAppBusy('chat', isStreaming)
  const chatWidthPercent = useSettingsStore((s) => s.chatWidthPercent)
  const chatModel = useSettingsStore((s) => s.chatModel)
  const setChatModel = useSettingsStore((s) => s.setChatModel)
  const chatAgentMode = useChatHistoryStore((s) => {
    const key = s.activeConversationId ?? '__default__'
    return s.agentModeByConversation[key] ?? 'agent'
  })
  const setChatAgentMode = useChatHistoryStore((s) => s.setActiveAgentMode)
  const activeSources = useChatHistoryStore((s) => s.activeSources)
  const addSource = useChatHistoryStore((s) => s.addSource)
  const activeToolCalls = useChatHistoryStore((s) => s.activeToolCalls)
  const { isDragOver } = useFileDrop()
  const [showRawText, setShowRawText] = useState(false)
  const [answeredMessageIds] = useState(() => new Set<string>())
  /**
   * Tracks which assistant messages have had their `ai-actions` row
   * resolved (the user clicked one of the buttons). A simple Set + a Map
   * is enough — we don't need React state since we re-render on every
   * stream tick anyway. We use useState with a stable initializer so the
   * identity survives renders, then bump a counter to force re-render
   * after each mutation.
   */
  const [resolvedActionMessageIds] = useState(() => new Set<string>())
  const [resolvedActionByMessageId] = useState(() => new Map<string, AIActionId>())
  const [, setActionResolutionTick] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const messagesAreaRef = useRef<HTMLDivElement>(null)
  const isUserScrolledUp = useRef(false)
  const isStreamingRef = useRef(false)
  const isProgrammaticScrollRef = useRef(false)
  const [isAtTop, setIsAtTop] = useState(true)
  const [isAtBottom, setIsAtBottom] = useState(false)
  const prevScrollHeightRef = useRef(0)

  useEffect(() => {
    isStreamingRef.current = isStreaming
  }, [isStreaming])

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    // During streaming, ignore scroll events caused by our own programmatic scrolling
    if (isProgrammaticScrollRef.current) {
      isProgrammaticScrollRef.current = false
      return
    }
    isUserScrolledUp.current = distanceFromBottom > 80
    setIsAtTop(el.scrollTop < 80)
    setIsAtBottom(distanceFromBottom < 80)

    // Load more messages when scrolled near the top
    if (el.scrollTop < 100 && hasMoreMessages && !isLoadingMessages) {
      prevScrollHeightRef.current = el.scrollHeight
      loadMoreMessages().then(() => {
        // Preserve scroll position after prepending older messages
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            const newScrollHeight = scrollContainerRef.current.scrollHeight
            scrollContainerRef.current.scrollTop = newScrollHeight - prevScrollHeightRef.current
          }
        })
      })
    }
  }, [hasMoreMessages, isLoadingMessages, loadMoreMessages])

  const scrollToTop = useCallback(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Streaming: synchronous scroll before paint — zero visual lag, 60fps
  // Respects user scroll-up: if user scrolled up, don't force them back down
  useLayoutEffect(() => {
    if (isStreaming && !isUserScrolledUp.current) {
      const el = scrollContainerRef.current
      if (el) {
        isProgrammaticScrollRef.current = true
        el.scrollTop = el.scrollHeight
      }
    }
  }, [isStreaming, streamingContent, toolCalls.length])

  // Non-streaming: smooth animated scroll on new messages
  useEffect(() => {
    if (!isStreaming && !isUserScrolledUp.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeMessages.length, isStreaming])

  const handleSend = useCallback(
    (content: string, images?: string[]) => {
      const _start = performance.now()
      console.log('[ChatFlow] ChatInput.handleSubmit() → ChatMain.handleSend()')
      if (!useChatHistoryStore.getState().activeConversationId) {
        console.log('[ChatFlow] ChatMain.handleSend() → store.createConversation()')
        createConversation()
      }
      console.log('[ChatFlow] ChatMain.handleSend() → useChatStream.sendMessage()')
      sendMessage(content, images)
      // Always scroll to bottom when user sends a message
      isUserScrolledUp.current = false
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
      const _end = performance.now()
      console.log(`[ChatFlow] ChatMain.handleSend() | start: ${_start.toFixed(2)}ms | end: ${_end.toFixed(2)}ms | diff: ${(_end - _start).toFixed(2)}ms`)
    },
    [sendMessage, createConversation]
  )

  const handleSummarize = useCallback(
    (text: string) => {
      const prompt = `Please provide a concise summary of the following text:\n\n"${text}"`
      handleSend(prompt)
      // Auto-scroll to chat input
      setTimeout(() => {
        const editorEl = document.querySelector('[data-chat-input]')
        editorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        const editor = (window as unknown as Record<string, unknown>).__chatEditor as import('@tiptap/react').Editor | undefined
        editor?.commands.focus()
      }, 100)
    },
    [handleSend]
  )

  /**
   * Handler for the `ai-actions` row rendered under an assistant message.
   *
   * - `implement` — Switch to `agent` mode, prime the next stream for
   *   pre-authorized destructive tool calls, then send the (AI- or
   *   default-) supplied implementation prompt as a follow-up user
   *   message.
   * - `refine` — Stay in the current mode and just send the refinement
   *   prompt so the assistant can iterate on its own plan.
   * - `cancel` — Mark the row resolved so the buttons disable; no send.
   */
  const handleAction = useCallback(
    (messageId: string, actionId: AIActionId, opts: { prompt?: string }) => {
      if (resolvedActionMessageIds.has(messageId)) return

      resolvedActionMessageIds.add(messageId)
      resolvedActionByMessageId.set(messageId, actionId)
      setActionResolutionTick((t) => t + 1)

      if (actionId === 'cancel') return

      if (actionId === 'implement') {
        // Flip into agent mode for this conversation so the AI has full
        // tool access for the implementation run.
        setChatAgentMode('agent')
        // Pre-authorize destructive tool calls for the NEXT send only.
        primeAutoApproveNextRun()
      }

      if (opts.prompt) {
        handleSend(opts.prompt)
      }
    },
    [
      resolvedActionMessageIds,
      resolvedActionByMessageId,
      setChatAgentMode,
      primeAutoApproveNextRun,
      handleSend,
    ],
  )

  const ensureConversation = useCallback((): string => {
    let convId = useChatHistoryStore.getState().activeConversationId
    if (!convId) convId = createConversation()
    return convId
  }, [createConversation])

  const handleBrowseFiles = useCallback(async () => {
    const convId = ensureConversation()
    const result = await window.api.selectResearchFiles()
    if (!result.success || !result.data) return
    const paths = result.data as string[]
    for (const p of paths) {
      const name = p.split('/').pop() ?? p
      await addSource({ sessionId: convId, sourceType: 'file', path: p, name })
    }
  }, [ensureConversation, addSource])

  const handleSelectRepo = useCallback(async () => {
    const convId = ensureConversation()
    const result = await window.api.selectLocalRepo()
    if (!result.success || !result.data) return
    const repoPath = result.data as string
    const name = repoPath.split('/').pop() ?? repoPath
    await addSource({ sessionId: convId, sourceType: 'repo', path: repoPath, name })
  }, [ensureConversation, addSource])

  const handleRawTextSubmit = useCallback(
    async (name: string, content: string) => {
      const convId = ensureConversation()
      await addSource({ sessionId: convId, sourceType: 'raw', path: content, name })
      setShowRawText(false)
    },
    [ensureConversation, addSource],
  )

  const handleExecuteFunction = useCallback(
    async (functionName: string, args: Record<string, unknown>): Promise<string> => {
      const sources = useChatHistoryStore.getState().activeSources
      const repoSource = sources.find((s) => s.sourceType === 'repo')
      return window.api.executeSingleTool(functionName, args, repoSource?.path ?? undefined)
    },
    [],
  )

  const messages = activeMessages
  const widthStyle = { maxWidth: `${chatWidthPercent}%` }

  // Group persisted tool calls by messageId for inline display
  const toolCallsByMessageId = useMemo(() => {
    const map = new Map<string, Array<{ id: string; toolName: string; args: Record<string, unknown>; result?: string; status: 'running' | 'done'; startedAt: string; completedAt?: string }>>()
    for (const tc of activeToolCalls) {
      const list = map.get(tc.messageId) ?? []
      let parsedArgs: Record<string, unknown> = {}
      try { parsedArgs = JSON.parse(tc.args) } catch { /* */ }
      list.push({
        id: tc.id,
        toolName: tc.toolName,
        args: parsedArgs,
        result: tc.result ?? undefined,
        status: tc.status === 'running' ? 'running' : 'done',
        startedAt: tc.startedAt,
        completedAt: tc.completedAt ?? undefined,
      })
      map.set(tc.messageId, list)
    }
    return map
  }, [activeToolCalls])

  return (
    <div className="flex-1 min-w-0 flex flex-col h-full relative bg-background">
      <SourcePreviewModal />
      <ChatHeader />
      {messages.length === 0 && !isStreaming && !isLoadingMessages ? (
        <ChatWelcome onSuggestionClick={handleSend} />
      ) : (
        <div className="relative flex-1 min-h-0">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="h-full overflow-y-auto overflow-x-hidden scrollbar-none px-4 py-6 space-y-4"
          >
            <div
              ref={messagesAreaRef}
              className="relative space-y-6"
              data-selection-toolbar
            >
              {isLoadingMessages && hasMoreMessages && (
                <div className="flex justify-center py-2">
                  <AppLoaderGlyph size={16} />
                </div>
              )}
              {messages.map((msg, idx) => {
                // Show crawl nav footer on the last assistant message (when not streaming)
                const isLastAssistant =
                  !isStreaming &&
                  msg.role === "assistant" &&
                  idx === messages.length - 1;
                return (
                  <ChatMessageBubble
                    key={msg.id}
                    message={msg}
                    widthStyle={widthStyle}
                    modelId={chatModel}
                    toolCalls={toolCallsByMessageId.get(msg.id)}
                    onResend={handleSend}
                    crawlNavLinks={isLastAssistant ? crawlNavLinks : undefined}
                    onCrawlNavigate={isLastAssistant ? handleSend : undefined}
                    answeredMessageIds={answeredMessageIds}
                    onExecuteFunction={handleExecuteFunction}
                    onAction={(actionId, opts) =>
                      handleAction(msg.id, actionId, opts)
                    }
                    resolvedActionMessageIds={resolvedActionMessageIds}
                    resolvedActionByMessageId={resolvedActionByMessageId}
                  />
                );
              })}
              {isStreaming && (
                <ChatMessageBubble
                  message={{
                    id: "streaming",
                    role: "assistant",
                    content: streamingContent,
                    timestamp: "",
                  }}
                  isStreaming
                  widthStyle={widthStyle}
                  modelId={chatModel}
                  toolCalls={toolCalls}
                  preToolContent={preToolContent}
                />
              )}
              {error && (
                <div
                  className="mx-auto text-destructive bg-destructive/10 rounded-lg p-3"
                  style={widthStyle}
                >
                  {error}
                </div>
              )}
              <SelectionToolbar
                containerRef={messagesAreaRef}
                onSummarize={handleSummarize}
              />
            </div>
            <div ref={messagesEndRef} />
          </div>
          {(!isAtTop || !isAtBottom) && (
            <div className="absolute bottom-2 right-1 flex flex-col gap-1 z-10">
              {!isAtTop && (
                <Tooltip content="Scroll to top" side="left">
                  <button
                    onClick={scrollToTop}
                    className="p-1.5 rounded-full bg-foreground/20 border border-border text-foreground hover:bg-foreground/30 shadow-md transition-all cursor-pointer"
                  >
                    <ArrowUp size={14} />
                  </button>
                </Tooltip>
              )}
              {!isAtBottom && (
                <Tooltip content="Scroll to bottom" side="left">
                  <button
                    onClick={scrollToBottom}
                    className="p-1.5 rounded-full bg-foreground/20 border border-border text-foreground hover:bg-foreground/30 shadow-md transition-all cursor-pointer"
                  >
                    <ArrowDown size={14} />
                  </button>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      )}
      {/* Chat input */}
      <ChatInput
        onSend={handleSend}
        isStreaming={isStreaming}
        onStop={stopStream}
        widthStyle={widthStyle}
        selectedModelId={chatModel}
        onModelChange={setChatModel}
        selectedAgentMode={chatAgentMode}
        onAgentModeChange={setChatAgentMode}
        onBrowseFiles={handleBrowseFiles}
        onSelectRepo={handleSelectRepo}
        onPasteText={() => setShowRawText(true)}
        sourceCount={activeSources.length}
      />
      {/* Drag-over indicator */}
      {isDragOver && (
        <div className="absolute inset-0 z-20 bg-primary/5 border-2 border-dashed border-primary/30 rounded-xl pointer-events-none flex items-center justify-center">
          <div className="text-sm text-primary font-medium">
            Drop files to add as sources
          </div>
        </div>
      )}
      {showRawText && (
        <RawTextDialog
          onSubmit={handleRawTextSubmit}
          onClose={() => setShowRawText(false)}
        />
      )}
    </div>
  );
}

function ChatHeader(): React.JSX.Element {
  const chatWidthPercent = useSettingsStore((s) => s.chatWidthPercent)
  const setChatWidthPercent = useSettingsStore((s) => s.setChatWidthPercent);

  const activeId = useChatHistoryStore((s) => s.activeConversationId)
  const conversations = useChatHistoryStore((s) => s.conversations)
  const chatTitle = useMemo(() => {
    if (!activeId) return 'New Chat'
    const conv = conversations.find((c) => c.id === activeId)
    return conv?.title || 'New Chat'
  }, [activeId, conversations])

  const widthItems = useMemo(
    () =>
      CHAT_WIDTH_OPTIONS.map((w) => ({
        key: String(w),
        label: `${w}%`,
        active: chatWidthPercent === w,
        onSelect: () => setChatWidthPercent(w),
      })),
    [chatWidthPercent, setChatWidthPercent],
  );

  return (
    <ChatSurfaceHeader
      title={chatTitle}
      icon={MessageSquare}
      className="h-12 px-4 border-b border-border/40 bg-card"
      actions={
        <Dropdown
          items={widthItems}
          openOn="click"
          align="right"
          showCheck
          trigger={
            <button className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer">
              {chatWidthPercent}%
              <ChevronDown size={10} />
            </button>
          }
        />
      }
    />
  );
}

function ChatWelcome(props: { onSuggestionClick?: (text: string) => void }): React.JSX.Element {
  const { onSuggestionClick } = props
  return (
    <div className="flex-1 flex flex-col">
      <ChatEmptyState
        title="How can I help you?"
        subtitle="Responses stream in real-time."
        suggestions={CHAT_WELCOME_SUGGESTIONS}
        onSuggestionClick={onSuggestionClick}
      />
    </div>
  )
}
