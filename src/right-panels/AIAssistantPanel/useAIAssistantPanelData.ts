import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { useAppShellId } from '@/components/AppShell/AppShellContext'
import { useReportAppBusy } from '@/components/GenisysApp/app-activity-registry'

import { useAIAssistantPanelContextData } from './AIAssistantPanel.context'
import type { AIEditorHandle } from './AIEditor'
import type { AIToolActivity } from './AIAssistantPanel.types'

/**
 * Derive a human-readable status label from the live tool activity list.
 * Prefers the most recent running activity; falls back to the most recent
 * activity regardless of status. Returns `undefined` when there are no
 * activities so the panel can fall back to its generic status label.
 */
function getLatestActivityLabel(toolActivities: AIToolActivity[]): string | undefined {
  if (toolActivities.length === 0) return undefined
  for (let i = toolActivities.length - 1; i >= 0; i--) {
    if (toolActivities[i].status === 'running') {
      return toolActivities[i].label ?? toolActivities[i].toolName
    }
  }
  const last = toolActivities[toolActivities.length - 1]
  return last.label ?? last.toolName
}

export function useAIAssistantPanelData() {
  const { data, actions } = useAIAssistantPanelContextData()

  const {
    messages,
    status,
    streamingContent,
    toolActivities,
    streamingReasoning,
    error,
    pendingConfirm,
    pendingContinue,
    sessions,
    activeSessionId,
    contextItems,
    contextLabel,
    emptyState,
    modes,
    selectedMode,
    contextScopes,
    selectedContextScopeId,
    mentionConfig,
    placeholder,
    isLoadingHistory,
    isLoadingMessages,
    hasMoreMessages,
    toolsInfo,
    selectedModelId,
    appId,
    resolvedActionMessageIds,
    resolvedActionByMessageId,
    queuedMessages,
  } = data

  const {
    sendMessage,
    steerMessage,
    enqueueMessage,
    removeQueuedMessage,
    confirmAction,
    cancelAction,
    continueLoop,
    stopLoop,
    resetSession,
    createSession,
    selectSession,
    removeSession,
    clearAllSessions,
    onModeChange,
    onContextScopeChange,
    loadMoreMessages,
    onModelChange,
    onActionClick,
    onStop,
    onInsertToEditor,
  } = actions

  const [showScrollButton, setShowScrollButton] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<AIEditorHandle>(null)
  const isUserScrolledUp = useRef(false)
  const lastTouchY = useRef(0)
  const pendingScrollToUser = useRef(false)

  const isStreaming = status === 'thinking' || status === 'executing'
  const hasMessages = messages.length > 0 || !!streamingContent

  // Protect the host app from keep-alive eviction while the AI panel is
  // streaming (thinking or executing tools). `useAppShellId()` resolves to the
  // host AppView because `AppShell` renders the right panel inside its provider.
  const hostAppId = useAppShellId()
  useReportAppBusy(hostAppId, isStreaming)
  const latestActivityLabel = useMemo(
    () => getLatestActivityLabel(toolActivities),
    [toolActivities],
  )

  // ── Scroll handling ──────────────────────────────────────

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight

    if (distanceFromBottom > 100) {
      isUserScrolledUp.current = true
    } else if (distanceFromBottom < 10) {
      // Only re-engage auto-scroll when truly at the bottom
      isUserScrolledUp.current = false
    }
    // Between 10-100px: maintain current state (hysteresis)

    setShowScrollButton((prev) => {
      const shouldShow = isUserScrolledUp.current
      return prev !== shouldShow ? shouldShow : prev
    })
  }, [])

  // Detect upward scroll intent immediately via wheel (fires before scroll event)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      isUserScrolledUp.current = true
      setShowScrollButton(true)
    }
  }, [])

  // Detect upward scroll intent via touch for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    lastTouchY.current = e.touches[0].clientY
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY
    if (currentY > lastTouchY.current) {
      // Finger moved down → scrolling up (viewing earlier content)
      isUserScrolledUp.current = true
      setShowScrollButton(true)
    }
    lastTouchY.current = currentY
  }, [])

  // Auto-follow streaming when user is at bottom
  useLayoutEffect(() => {
    if (!isStreaming || isUserScrolledUp.current) return
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [isStreaming, streamingContent, toolActivities.length])

  // Scroll user message to top after send
  useLayoutEffect(() => {
    if (!pendingScrollToUser.current) return
    pendingScrollToUser.current = false
    const el = scrollRef.current
    if (!el) return
    const userMessages = el.querySelectorAll('[data-role="user"]')
    const lastUserMsg = userMessages[userMessages.length - 1]
    if (lastUserMsg) {
      // Double-rAF to ensure layout is settled before smooth scroll
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          lastUserMsg.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
      })
    }
  }, [messages.length])

  // Smooth scroll on finalized content (assistant responses)
  useEffect(() => {
    if (isStreaming || isUserScrolledUp.current) return
    // Skip if this was triggered by the user's own message (handled above)
    const lastMsg = messages[messages.length - 1]
    if (lastMsg?.role === 'user') return
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages.length, isStreaming])

  // Reset scroll state on session change
  useEffect(() => {
    isUserScrolledUp.current = false
    setShowScrollButton(false)
  }, [activeSessionId])

  // Auto-scroll to confirmation panel when it appears
  useEffect(() => {
    if (!pendingConfirm) return
    isUserScrolledUp.current = false
    setShowScrollButton(false)
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    })
  }, [pendingConfirm])

  const scrollToBottom = useCallback(() => {
    isUserScrolledUp.current = false
    setShowScrollButton(false)
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [])

  // ── Session actions ──────────────────────────────────────

  const handleNewChat = useCallback(() => {
    // If active session has no messages, just focus input
    const activeSession = sessions.find((s) => s.id === activeSessionId)
    if (activeSession) {
      // Find message count — if session is in sessions list check related messages
      // For generic usage, just create a new session
    }
    createSession()
    requestAnimationFrame(() => editorRef.current?.focus())
  }, [activeSessionId, sessions, createSession])

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      if (sessionId === activeSessionId) return
      selectSession(sessionId)
    },
    [activeSessionId, selectSession],
  )

  // ── Submit ───────────────────────────────────────────────

  // Surfaces opt into steering/queuing by providing `steerMessage`. When they
  // do, the composer stays editable while busy and Enter steers / ⌥Enter queues.
  const steerEnabled = Boolean(steerMessage)

  const handleSubmit = useCallback(
    (intent: 'send' | 'queue' = 'send') => {
      const text = editorRef.current?.getText() ?? ''
      const trimmed = text.trim()
      if (!trimmed) return

      const mentions = editorRef.current?.getMentions() ?? []
      const isBusy = status === 'thinking' || status === 'executing'

      // While a turn is running, steer-capable surfaces route a plain Enter to
      // steer the live turn and ⌥/Alt+Enter to queue for after it finishes.
      if (isBusy && steerEnabled) {
        if (intent === 'queue') {
          enqueueMessage?.(trimmed, mentions)
        } else {
          steerMessage?.(trimmed, mentions)
        }
        editorRef.current?.clear()
        return
      }

      // Surfaces without steering stay blocked while busy (previous behavior).
      if (isBusy) return

      editorRef.current?.clear()
      sendMessage(trimmed, mentions)

      isUserScrolledUp.current = false
      setShowScrollButton(false)
      pendingScrollToUser.current = true
    },
    [status, sendMessage, steerEnabled, steerMessage, enqueueMessage],
  )

  return {
    // Data
    messages,
    status,
    streamingContent,
    toolActivities,
    streamingReasoning,
    latestActivityLabel,
    error,
    pendingConfirm,
    pendingContinue,
    sessions,
    activeSessionId,
    contextItems,
    contextLabel,
    emptyState,
    modes,
    selectedMode,
    contextScopes,
    selectedContextScopeId,
    mentionConfig,
    placeholder,
    isStreaming,
    hasMessages,
    showScrollButton,
    toolsInfo,
    isLoadingHistory: isLoadingHistory ?? false,
    isLoadingMessages: isLoadingMessages ?? false,
    hasMoreMessages: hasMoreMessages ?? false,
    selectedModelId,
    appId,
    resolvedActionMessageIds,
    resolvedActionByMessageId,
    queuedMessages,
    steerEnabled,

    // Refs
    scrollRef,
    editorRef,

    // Actions
    sendMessage,
    steerMessage,
    enqueueMessage,
    removeQueuedMessage,
    confirmAction,
    cancelAction,
    continueLoop,
    stopLoop,
    onStop,
    resetSession,
    removeSession,
    clearAllSessions,
    onModeChange,
    onContextScopeChange,
    loadMoreMessages,
    onModelChange,
    onActionClick,
    onInsertToEditor,

    // Handlers
    handleScroll,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleNewChat,
    handleSelectSession,
    handleSubmit,
    scrollToBottom,
  }
}
