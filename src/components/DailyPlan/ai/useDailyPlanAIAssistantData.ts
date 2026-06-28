import { useState, useCallback, useMemo, useEffect, useRef } from 'react'

import type {
  AIAssistantPanelData,
  AIAssistantPanelActions,
  AIMessage,
  AIStatus,
  AIToolActivity,
  AIConfirmAction,
} from '@/right-panels/AIAssistantPanel'
import { useAIAssistantHistory, useActionResolution, useAIPanelModelSelection, usePendingContinue } from '@/right-panels/AIAssistantPanel'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { formatDate } from '@/components/DailyPlan/utils/formatDate'
import { runDailyPlanAI } from './runner'
import { buildDailyPlanSystemPrompt } from '@/prompts/dailyPlanSystemPrompt'
import { useSettingsStore } from '@/store/settings-store'
import { resolveAppModel } from '@/lib/resolveAppModel'
import { AGENT_MODES, type AgentMode } from '@/components/Chat/components/AgentModeSelector'
import { buildModeAwareSystemPrompt } from '@/lib/buildModeAwareSystemPrompt'
import { isAutoApproveAgentMode } from '@/lib/ai-assistant-auto-approve'
import { useLatestRef } from '@/hooks/useLatestRef'

const NOOP = (): void => {}

const DAILYPLAN_PANEL_APP_ID = 'dailyplan'

/**
 * Resolve the user-selected model id for the Daily Plan AI panel.
 * Read at call-time (not via a React selector) so a model change in
 * Settings is picked up on the next `sendMessage` without forcing the
 * hook to re-subscribe / re-render.
 */
function getDailyPlanModel(): string {
  return resolveAppModel(DAILYPLAN_PANEL_APP_ID)
}

interface DailyPlanAIAssistantReturn {
  data: AIAssistantPanelData
  actions: AIAssistantPanelActions
}

export function useDailyPlanAIAssistantData(): DailyPlanAIAssistantReturn {
  const selectedDate = useDailyPlanStore((s) => s.selectedDate)

  const [messages, setMessages] = useState<AIMessage[]>([])
  const [status, setStatus] = useState<AIStatus>('idle')
  const [streamingContent, setStreamingContent] = useState('')
  const [toolActivities, setToolActivities] = useState<AIToolActivity[]>([])
  const [streamingReasoning, setStreamingReasoning] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pendingConfirm, setPendingConfirm] = useState<AIConfirmAction | null>(null)

  const continueState = usePendingContinue()

  const settingsMode = useSettingsStore((s) => s.getAiModeForApp('dailyplan'))
  const [sessionModeOverride, setSessionModeOverride] = useState<AgentMode | null>(null)
  const activeMode = sessionModeOverride ?? settingsMode
  const activeModeRef = useLatestRef(activeMode)

  const history = useAIAssistantHistory('dailyplan')

  const { selectedModelId, onModelChange } =
    useAIPanelModelSelection(DAILYPLAN_PANEL_APP_ID)

  const conversationIdRef = useRef<string | null>(null)
  const activeSessionIdRef = useRef<string | null>(null)
  const requestRef = useRef(0)
  const streamBufferRef = useRef('')
  const rafIdRef = useRef<number | null>(null)
  const messagesRef = useRef(messages)
  messagesRef.current = messages
  const historyRef = useRef(history)
  historyRef.current = history

  // Pending confirm promise resolver
  const confirmResolverRef = useRef<((confirmed: boolean) => void) | null>(null)

  // Build conversation history for the runner
  const buildConversationHistory = useCallback(() => {
    return messagesRef.current.map((m) => ({
      role: m.role,
      content: m.content,
    }))
  }, [])

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: AIMessage = { id: `user-${Date.now()}`, role: 'user', content: text }
      setMessages((prev) => [...prev, userMsg])
      setStatus('thinking')
      setError(null)
      setStreamingContent('')
      setToolActivities([])
      setStreamingReasoning('')
      streamBufferRef.current = ''

      const requestId = ++requestRef.current

      // Local accumulators feed the persisted assistant message at
      // onDone-time so we don't race React state batching.
      let reasoningBuffer = ''
      const activitiesBuffer: AIToolActivity[] = []

      try {
        if (!conversationIdRef.current) conversationIdRef.current = crypto.randomUUID()
        if (!activeSessionIdRef.current) {
          activeSessionIdRef.current = crypto.randomUUID()
          history.registerSessionConversation(activeSessionIdRef.current, conversationIdRef.current)
        }

        const convId = conversationIdRef.current
        const now = new Date().toISOString()

        // Persist user message
        await window.api.appendChatMessage(convId, `DailyPlan AI`, now, now, {
          id: userMsg.id,
          role: 'user',
          content: text,
          timestamp: now,
        })

        const systemPrompt = buildModeAwareSystemPrompt(buildDailyPlanSystemPrompt(), activeMode)
        const conversationHistory = buildConversationHistory()
        // Remove the last message (the one we just added) from history since runner adds it
        conversationHistory.pop()

        await runDailyPlanAI(systemPrompt, conversationHistory, text, {
          onChunk: (token) => {
            if (requestRef.current !== requestId) return
            streamBufferRef.current += token
            if (rafIdRef.current === null) {
              rafIdRef.current = requestAnimationFrame(() => {
                rafIdRef.current = null
                setStreamingContent(streamBufferRef.current)
              })
            }
          },
          onReasoningChunk: (token) => {
            if (requestRef.current !== requestId) return
            reasoningBuffer += token
            setStreamingReasoning((prev) => prev + token)
          },
          onToolStart: (activity) => {
            if (requestRef.current !== requestId) return
            activitiesBuffer.push(activity)
            setStatus('executing')
            setToolActivities((prev) => [...prev, activity])
          },
          onToolResult: (toolName, _result) => {
            if (requestRef.current !== requestId) return
            for (let i = activitiesBuffer.length - 1; i >= 0; i--) {
              if (activitiesBuffer[i].toolName === toolName && activitiesBuffer[i].status === 'running') {
                activitiesBuffer[i] = { ...activitiesBuffer[i], status: 'done' }
                break
              }
            }
            setToolActivities((prev) =>
              prev.map((a) =>
                a.toolName === toolName && a.status === 'running'
                  ? { ...a, status: 'done' as const }
                  : a,
              ),
            )
          },
          onConfirmRequired: (confirmAction) => {
            return new Promise<boolean>((resolve) => {
              if (requestRef.current !== requestId) {
                resolve(false)
                return
              }
              setPendingConfirm(confirmAction)
              setStatus('awaiting-confirmation')
              confirmResolverRef.current = resolve
            })
          },
          isAutoApprove: () => isAutoApproveAgentMode(activeModeRef.current),
          onContinueRequired: continueState.onContinueRequired,
          onDone: async (content) => {
            if (requestRef.current !== requestId) return
            streamBufferRef.current = ''
            if (rafIdRef.current !== null) {
              cancelAnimationFrame(rafIdRef.current)
              rafIdRef.current = null
            }
            setStreamingContent('')
            setStreamingReasoning('')
            setStatus('idle')
            if (content) {
              const assistantMsg: AIMessage = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content,
                ...(reasoningBuffer ? { reasoning: reasoningBuffer } : {}),
                ...(activitiesBuffer.length > 0 ? { activities: activitiesBuffer } : {}),
              }
              setMessages((prev) => [...prev, assistantMsg])

              // Persist assistant message
              const convId2 = conversationIdRef.current
              if (convId2) {
                const now2 = new Date().toISOString()
                window.api.appendChatMessage(convId2, '', now2, now2, {
                  id: assistantMsg.id,
                  role: 'assistant',
                  content,
                  timestamp: now2,
                  reasoning: reasoningBuffer || undefined,
                  activitiesJson: activitiesBuffer.length > 0 ? JSON.stringify(activitiesBuffer) : undefined,
                }).catch(() => {})

                const firstUserMsg = messagesRef.current.find((m) => m.role === 'user')?.content ?? 'Chat'
                historyRef.current.saveCurrentSession(convId2, firstUserMsg, activeSessionIdRef.current ?? undefined)
              }
            }
          },
          onError: (errorMsg) => {
            if (requestRef.current !== requestId) return
            streamBufferRef.current = ''
            if (rafIdRef.current !== null) {
              cancelAnimationFrame(rafIdRef.current)
              rafIdRef.current = null
            }
            setStreamingContent('')
            setStreamingReasoning('')
            setStatus('idle')
            setError(errorMsg)
          },
        }, { mode: activeModeRef.current, model: getDailyPlanModel() })
      } catch (err) {
        setStatus('idle')
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      }
    },
    [history, buildConversationHistory],
  )

  const confirmAction = useCallback(() => {
    if (confirmResolverRef.current) {
      confirmResolverRef.current(true)
      confirmResolverRef.current = null
    }
    setPendingConfirm(null)
    setStatus('executing')
  }, [])

  const cancelAction = useCallback(() => {
    if (confirmResolverRef.current) {
      confirmResolverRef.current(false)
      confirmResolverRef.current = null
    }
    setPendingConfirm(null)
    setStatus('executing')
  }, [])

  const clearActiveState = useCallback(() => {
    streamBufferRef.current = ''
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
    conversationIdRef.current = null
    activeSessionIdRef.current = null
    confirmResolverRef.current = null
    setMessages([])
    setStatus('idle')
    setStreamingContent('')
    setToolActivities([])
    setStreamingReasoning('')
    setError(null)
    setPendingConfirm(null)
  }, [])

  const resetSession = useCallback(() => {
    if (activeSessionIdRef.current) {
      history.removeSession(activeSessionIdRef.current)
    } else if (conversationIdRef.current) {
      window.api.removeChatConversation(conversationIdRef.current).catch(() => {})
    }
    clearActiveState()
  }, [history, clearActiveState])

  const createSession = useCallback(() => {
    if (messages.length > 0 && conversationIdRef.current) {
      const firstUserMsg = messages.find((m) => m.role === 'user')?.content ?? 'Chat'
      history.saveCurrentSession(conversationIdRef.current, firstUserMsg, activeSessionIdRef.current ?? undefined)
    }
    clearActiveState()
  }, [messages, history, clearActiveState])

  const selectSession = useCallback(
    (sessionId: string) => {
      if (sessionId === activeSessionIdRef.current) return
      if (messages.length > 0 && conversationIdRef.current) {
        const firstUserMsg = messages.find((m) => m.role === 'user')?.content ?? 'Chat'
        history.saveCurrentSession(conversationIdRef.current, firstUserMsg, activeSessionIdRef.current ?? undefined)
      }
      streamBufferRef.current = ''
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
      confirmResolverRef.current = null
      setStatus('idle')
      setStreamingContent('')
      setToolActivities([])
      setStreamingReasoning('')
      setError(null)
      setPendingConfirm(null)
      activeSessionIdRef.current = sessionId
      const convId = history.getConversationId(sessionId)
      conversationIdRef.current = convId
      history.selectSession(sessionId)
    },
    [messages, history],
  )

  useEffect(() => {
    if (history.activeSessionId && history.activeSessionId === activeSessionIdRef.current) {
      setMessages(history.historicalMessages)
    }
  }, [history.activeSessionId, history.historicalMessages])

  const removeSession = useCallback(
    (sessionId: string) => {
      history.removeSession(sessionId)
      if (sessionId === activeSessionIdRef.current) clearActiveState()
    },
    [history, clearActiveState],
  )

  const clearAllSessions = useCallback(() => {
    history.clearAllSessions(activeSessionIdRef.current ?? undefined)
  }, [history])

  // ── Context items (show selected date) ──
  const contextItems = useMemo(
    () => [
      {
        id: 'selected-date',
        label: formatDate(selectedDate),
        sublabel: 'Selected date',
      },
    ],
    [selectedDate],
  )

  const {
    resolvedActionMessageIds,
    resolvedActionByMessageId,
    onActionClick,
  } = useActionResolution({
    sendMessage,
    setAgentMode: useCallback(() => setSessionModeOverride('agent'), []),
    confirmAction,
    pendingConfirm,
    status,
  })

  const onStop = useCallback(() => {
    requestRef.current++
    streamBufferRef.current = ''
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
    if (confirmResolverRef.current) {
      confirmResolverRef.current(false)
      confirmResolverRef.current = null
    }
    setStreamingContent('')
    setStreamingReasoning('')
    setToolActivities((prev) =>
      prev.map((a) => (a.status === 'running' ? { ...a, status: 'done' as const } : a)),
    )
    setPendingConfirm(null)
    setStatus('idle')
  }, [])

  const data: AIAssistantPanelData = useMemo(
    () => ({
      messages,
      status,
      streamingContent,
      toolActivities,
      streamingReasoning,
      error,
      pendingConfirm,
      pendingContinue: continueState.pendingContinue,
      sessions: history.sessions,
      activeSessionId: history.activeSessionId,
      contextItems,
      contextLabel: 'Schedule',
      emptyState: {
        title: 'Ask AI about your schedule',
        suggestions: [
          '"What\'s on my schedule today?"',
          '"Create a task: review PRs at 3pm"',
          '"Reschedule my 3 PM meeting to 4 PM"',
          '"Summarize my week"',
        ],
      },
      placeholder: 'Ask about your schedule…',
      modes: AGENT_MODES,
      selectedMode: activeMode,
      selectedModelId,
      appId: 'dailyplan',
      isLoadingHistory: history.isLoadingHistory,
      isLoadingMessages: history.isLoadingMessages,
      hasMoreMessages: history.hasMoreMessages,
      resolvedActionMessageIds,
      resolvedActionByMessageId,
    }),
    [messages, status, streamingContent, toolActivities, streamingReasoning, error, pendingConfirm,
     continueState.pendingContinue,
     history.sessions, history.activeSessionId, history.isLoadingHistory,
     history.isLoadingMessages, history.hasMoreMessages, contextItems, activeMode, selectedModelId,
     resolvedActionMessageIds, resolvedActionByMessageId],
  )

  const actions: AIAssistantPanelActions = useMemo(
    () => ({
      sendMessage: sendMessage as unknown as AIAssistantPanelActions['sendMessage'],
      confirmAction,
      cancelAction,
      onStop,
      continueLoop: continueState.continueLoop,
      stopLoop: continueState.stopLoop,
      resetSession,
      createSession,
      selectSession,
      removeSession,
      clearAllSessions,
      onModeChange: ((modeId: string) => setSessionModeOverride(modeId as AgentMode)) as AIAssistantPanelActions['onModeChange'],
      onModelChange,
      loadMoreMessages: history.loadMoreMessages,
      onActionClick,
    }),
    [sendMessage, confirmAction, cancelAction, onStop,
     continueState.continueLoop, continueState.stopLoop,
     resetSession, createSession,
     selectSession, removeSession, clearAllSessions, onModelChange, history.loadMoreMessages,
     onActionClick],
  )

  return { data, actions }
}
