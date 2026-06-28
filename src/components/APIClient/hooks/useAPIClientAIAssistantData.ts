import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { Send } from 'lucide-react'

import { resolveAppModel } from '@/lib/resolveAppModel'

import { useApiClientStore } from '@/store/api-client-store'
import type {
  AIAssistantPanelData,
  AIAssistantPanelActions,
  AIContextItem,
  AIConfirmAction,
  AIMessage,
  AIStatus,
  AIToolActivity,
} from '@/right-panels/AIAssistantPanel'
import {
  useAIAssistantHistory,
  useActionResolution,
  useAIPanelModelSelection,
  usePendingContinue,
} from '@/right-panels/AIAssistantPanel'
import { useSettingsStore } from '@/store/settings-store'
import { AGENT_MODES, type AgentMode } from '@/components/Chat/components/AgentModeSelector'
import { buildModeAwareSystemPrompt } from '@/lib/buildModeAwareSystemPrompt'
import { isAutoApproveAgentMode } from '@/lib/ai-assistant-auto-approve'
import { useLatestRef } from '@/hooks/useLatestRef'

import { runApiClientAI } from '../ai/runner'
import { buildApiClientSystemPrompt } from '@/prompts/apiClientSystemPrompt'

const API_CLIENT_PANEL_APP_ID = 'apiclient'

/**
 * Resolve the user-selected model id for the API Client AI panel.
 * Read at call-time (not via a React selector) so a model change in
 * Settings is picked up on the next `sendMessage` without re-rendering.
 */
function getApiClientModel(): string {
  return resolveAppModel(API_CLIENT_PANEL_APP_ID)
}

interface APIClientAIAssistantReturn {
  data: AIAssistantPanelData
  actions: AIAssistantPanelActions
}

export function useAPIClientAIAssistantData(): APIClientAIAssistantReturn {
  const activeRequestId = useApiClientStore((s) => s.activeRequestId)
  const requests = useApiClientStore((s) => s.requests)
  const activeResponse = useApiClientStore((s) => s.activeResponse)

  const activeRequest = useMemo(
    () => requests.find((r) => r.id === activeRequestId) ?? null,
    [requests, activeRequestId],
  )

  const [messages, setMessages] = useState<AIMessage[]>([])
  const [status, setStatus] = useState<AIStatus>('idle')
  const [streamingContent, setStreamingContent] = useState('')
  const [toolActivities, setToolActivities] = useState<AIToolActivity[]>([])
  const [streamingReasoning, setStreamingReasoning] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pendingConfirm, setPendingConfirm] = useState<AIConfirmAction | null>(null)

  const continueState = usePendingContinue()

  const settingsMode = useSettingsStore((s) => s.getAiModeForApp('apiclient'))
  const [sessionModeOverride, setSessionModeOverride] = useState<AgentMode | null>(null)
  const activeMode = sessionModeOverride ?? settingsMode
  const activeModeRef = useLatestRef(activeMode)

  // ── Persistent history via shared hook ─────────────────────
  const history = useAIAssistantHistory('apiclient')

  // ── Model selection (per-app override → global default) ────
  const { selectedModelId, onModelChange } =
    useAIPanelModelSelection(API_CLIENT_PANEL_APP_ID)

  const conversationIdRef = useRef<string | null>(null)
  const activeSessionIdRef = useRef<string | null>(null)
  // Request counter for soft-cancelling in-flight runs (onStop)
  const requestRef = useRef(0)
  // Buffer for rAF-batched streaming content
  const streamBufferRef = useRef('')
  const rafIdRef = useRef<number | null>(null)
  // Refs to avoid stale closures
  const messagesRef = useRef(messages)
  messagesRef.current = messages
  const historyRef = useRef(history)
  historyRef.current = history
  // Pending confirm promise resolver
  const confirmResolverRef = useRef<((confirmed: boolean) => void) | null>(null)

  // ── Build context string for AI prompt ─────────────────────

  const buildContextString = useCallback((): string => {
    if (!activeRequest) return ''

    const parts: string[] = []

    // Active request details
    const enabledParams = activeRequest.params.filter((p) => p.enabled)
    const enabledHeaders = activeRequest.headers.filter((h) => h.enabled)

    parts.push(`## Active Request: ${activeRequest.name}`)
    parts.push(`- **Method:** ${activeRequest.method}`)
    parts.push(`- **URL:** ${activeRequest.url}`)

    if (enabledParams.length > 0) {
      const paramStr = enabledParams
        .map((p) => `  - ${p.key}: ${p.value}`)
        .join('\n')
      parts.push(`- **Query Params:**\n${paramStr}`)
    }

    if (enabledHeaders.length > 0) {
      const headerStr = enabledHeaders
        .map((h) => `  - ${h.key}: ${h.value}`)
        .join('\n')
      parts.push(`- **Headers:**\n${headerStr}`)
    }

    if (activeRequest.bodyType !== 'none' && activeRequest.bodyContent) {
      const bodyPreview =
        activeRequest.bodyContent.length > 2000
          ? activeRequest.bodyContent.slice(0, 2000) + '\n... (truncated)'
          : activeRequest.bodyContent
      parts.push(`- **Body Type:** ${activeRequest.bodyType}`)
      parts.push(`- **Body:**\n\`\`\`\n${bodyPreview}\n\`\`\``)
    }

    if (activeRequest.authType !== 'none') {
      parts.push(`- **Auth Type:** ${activeRequest.authType}`)
    }

    // Active response details
    if (activeResponse) {
      parts.push(`\n## Last Response`)
      parts.push(
        `- **Status:** ${activeResponse.status} ${activeResponse.statusText}`,
      )
      parts.push(`- **Time:** ${activeResponse.time}ms`)
      parts.push(`- **Size:** ${activeResponse.size} bytes`)

      if (activeResponse.headers) {
        const respHeaderStr = Object.entries(activeResponse.headers)
          .map(([k, v]) => `  - ${k}: ${v}`)
          .join('\n')
        parts.push(`- **Response Headers:**\n${respHeaderStr}`)
      }

      if (activeResponse.body) {
        const bodyPreview =
          activeResponse.body.length > 3000
            ? activeResponse.body.slice(0, 3000) + '\n... (truncated)'
            : activeResponse.body
        parts.push(`- **Response Body:**\n\`\`\`\n${bodyPreview}\n\`\`\``)
      }
    }

    return `\n\n--- CONTEXT ---\n${parts.join('\n')}\n--- END CONTEXT ---`
  }, [activeRequest, activeResponse])

  // ── Build conversation history for the runner ──────────────

  const buildConversationHistory = useCallback(() => {
    return messagesRef.current.map((m) => ({
      role: m.role,
      content: m.content,
    }))
  }, [])

  // ── sendMessage ────────────────────────────────────────────

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: AIMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
      }
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
        if (!conversationIdRef.current) {
          conversationIdRef.current = crypto.randomUUID()
        }
        if (!activeSessionIdRef.current) {
          activeSessionIdRef.current = crypto.randomUUID()
          history.registerSessionConversation(
            activeSessionIdRef.current,
            conversationIdRef.current,
          )
        }

        const convId = conversationIdRef.current
        const now = new Date().toISOString()

        // Persist user message to DB
        await window.api.appendChatMessage(
          convId,
          `API Client AI: ${activeRequest?.name ?? 'Chat'}`,
          now,
          now,
          {
            id: userMsg.id,
            role: 'user',
            content: text,
            timestamp: now,
          },
        )

        // Build system prompt with request/response context
        const fullSystemPrompt = buildModeAwareSystemPrompt(
          buildApiClientSystemPrompt() + buildContextString(),
          activeMode,
        )
        const conversationHistory = buildConversationHistory()
        // Remove the last message (the one we just added) — runner re-adds it.
        conversationHistory.pop()

        await runApiClientAI(
          fullSystemPrompt,
          conversationHistory,
          text,
          {
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
                if (
                  activitiesBuffer[i].toolName === toolName &&
                  activitiesBuffer[i].status === 'running'
                ) {
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
                  ...(activitiesBuffer.length > 0
                    ? { activities: activitiesBuffer }
                    : {}),
                }
                setMessages((prev) => [...prev, assistantMsg])

                // Persist assistant message to DB
                const convId2 = conversationIdRef.current
                if (convId2) {
                  const now2 = new Date().toISOString()
                  window.api
                    .appendChatMessage(convId2, '', now2, now2, {
                      id: assistantMsg.id,
                      role: 'assistant',
                      content,
                      timestamp: now2,
                      reasoning: reasoningBuffer || undefined,
                      activitiesJson:
                        activitiesBuffer.length > 0
                          ? JSON.stringify(activitiesBuffer)
                          : undefined,
                    })
                    .catch(() => {})

                  const firstUserMsg =
                    messagesRef.current.find((m) => m.role === 'user')
                      ?.content ?? 'Chat'
                  historyRef.current.saveCurrentSession(
                    convId2,
                    firstUserMsg,
                    activeSessionIdRef.current ?? undefined,
                  )
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
          },
          { mode: activeModeRef.current, model: getApiClientModel() },
        )
      } catch (err) {
        setStatus('idle')
        setError(
          err instanceof Error ? err.message : 'An unexpected error occurred',
        )
      }
    },
    [
      activeRequest,
      buildContextString,
      buildConversationHistory,
      history,
      activeMode,
      activeModeRef,
      continueState.onContinueRequired,
    ],
  )

  // ── Confirmation handlers ──────────────────────────────────

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

  // ── Session helpers ────────────────────────────────────────

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
      window.api
        .removeChatConversation(conversationIdRef.current)
        .catch(() => {})
    }
    clearActiveState()
  }, [history, clearActiveState])

  const createSession = useCallback(() => {
    if (messages.length > 0 && conversationIdRef.current) {
      const firstUserMsg =
        messages.find((m) => m.role === 'user')?.content ?? 'Chat'
      history.saveCurrentSession(
        conversationIdRef.current,
        firstUserMsg,
        activeSessionIdRef.current ?? undefined,
      )
    }

    clearActiveState()
  }, [messages, history, clearActiveState])

  const selectSession = useCallback(
    (sessionId: string) => {
      if (sessionId === activeSessionIdRef.current) return

      // Save current chat first if it has messages
      if (messages.length > 0 && conversationIdRef.current) {
        const firstUserMsg =
          messages.find((m) => m.role === 'user')?.content ?? 'Chat'
        history.saveCurrentSession(
          conversationIdRef.current,
          firstUserMsg,
          activeSessionIdRef.current ?? undefined,
        )
      }

      // Clear current state
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

      // Set the session as active
      activeSessionIdRef.current = sessionId
      const convId = history.getConversationId(sessionId)
      conversationIdRef.current = convId

      // Delegate to history hook which lazy-loads messages from DB
      history.selectSession(sessionId)
    },
    [messages, history],
  )

  // When history hook loads messages for a selected session, sync to local state
  useEffect(() => {
    if (
      history.activeSessionId &&
      history.activeSessionId === activeSessionIdRef.current
    ) {
      setMessages(history.historicalMessages)
    }
  }, [history.activeSessionId, history.historicalMessages])

  const removeSession = useCallback(
    (sessionId: string) => {
      history.removeSession(sessionId)

      if (sessionId === activeSessionIdRef.current) {
        clearActiveState()
      }
    },
    [history, clearActiveState],
  )

  const clearAllSessions = useCallback(() => {
    history.clearAllSessions(activeSessionIdRef.current ?? undefined)
  }, [history])

  // ── Action resolution (Implement / Refine / Cancel) ────────

  const { resolvedActionMessageIds, resolvedActionByMessageId, onActionClick } =
    useActionResolution({
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
      prev.map((a) =>
        a.status === 'running' ? { ...a, status: 'done' as const } : a,
      ),
    )
    setPendingConfirm(null)
    setStatus('idle')
  }, [])

  // ── Assemble data + actions ────────────────────────────────

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
      contextItems: activeRequest
        ? [
            {
              id: activeRequest.id,
              label: `${activeRequest.method} ${activeRequest.name}`,
              sublabel: activeRequest.url || undefined,
              icon: Send,
            } satisfies AIContextItem,
          ]
        : [],
      emptyState: activeRequest
        ? {
            title: 'Ask AI about your API request',
            suggestions: [
              '"Send this request and explain the response"',
              '"Why is this returning a 401?"',
              '"Add an Authorization header"',
              '"Create a POST request to this endpoint"',
            ],
          }
        : {
            title: 'Ask AI anything about APIs',
            suggestions: [
              '"Create a new collection called Auth"',
              '"Import this cURL command"',
              '"Switch to the Staging environment"',
              '"List my recent requests"',
            ],
          },
      placeholder: activeRequest
        ? 'Ask about — or act on — your request…'
        : 'Ask anything about APIs…',
      modes: AGENT_MODES,
      selectedMode: activeMode,
      selectedModelId,
      appId: 'apiclient',
      isLoadingHistory: history.isLoadingHistory,
      isLoadingMessages: history.isLoadingMessages,
      hasMoreMessages: history.hasMoreMessages,
      resolvedActionMessageIds,
      resolvedActionByMessageId,
    }),
    [
      messages,
      status,
      streamingContent,
      toolActivities,
      streamingReasoning,
      error,
      pendingConfirm,
      continueState.pendingContinue,
      activeRequest,
      history.sessions,
      history.activeSessionId,
      history.isLoadingHistory,
      history.isLoadingMessages,
      history.hasMoreMessages,
      activeMode,
      selectedModelId,
      resolvedActionMessageIds,
      resolvedActionByMessageId,
    ],
  )

  const actions: AIAssistantPanelActions = useMemo(
    () => ({
      sendMessage:
        sendMessage as unknown as AIAssistantPanelActions['sendMessage'],
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
      onModeChange: ((modeId: string) =>
        setSessionModeOverride(
          modeId as AgentMode,
        )) as AIAssistantPanelActions['onModeChange'],
      onModelChange,
      loadMoreMessages: history.loadMoreMessages,
      onActionClick,
    }),
    [
      sendMessage,
      confirmAction,
      cancelAction,
      onStop,
      continueState.continueLoop,
      continueState.stopLoop,
      resetSession,
      createSession,
      selectSession,
      removeSession,
      clearAllSessions,
      onModelChange,
      history.loadMoreMessages,
      onActionClick,
    ],
  )

  return { data, actions }
}
