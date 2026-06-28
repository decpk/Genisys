import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { Server } from 'lucide-react'

import { resolveAppModel } from '@/lib/resolveAppModel'

import { useMockServerStore } from '@/store/mock-server-store'
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

import { runMockServerAI } from './runner'
import { buildMockServerSystemPrompt } from '@/prompts/mockServerSystemPrompt'

const MOCKSERVER_PANEL_APP_ID = 'mockserver'

/**
 * Resolve the user-selected model id for the Mock Server AI panel.
 * Read at call-time (not via a React selector) so a model change in
 * Settings is picked up on the next `sendMessage` without re-rendering.
 */
function getMockServerModel(): string {
  return resolveAppModel(MOCKSERVER_PANEL_APP_ID)
}

interface MockServerAIAssistantReturn {
  data: AIAssistantPanelData
  actions: AIAssistantPanelActions
}

export function useMockServerAIAssistantData(): MockServerAIAssistantReturn {
  const selectedServerId = useMockServerStore((s) => s.selectedServerId)
  const selectedEndpointId = useMockServerStore((s) => s.selectedEndpointId)
  const servers = useMockServerStore((s) => s.servers)
  const projects = useMockServerStore((s) => s.projects)
  const endpoints = useMockServerStore((s) => s.endpoints)
  const runningServers = useMockServerStore((s) => s.runningServers)

  const selectedServer = useMemo(
    () => servers.find((srv) => srv.id === selectedServerId) ?? null,
    [servers, selectedServerId],
  )

  const selectedProject = useMemo(
    () =>
      selectedServer
        ? projects.find((p) => p.id === selectedServer.project_id) ?? null
        : null,
    [projects, selectedServer],
  )

  const serverEndpoints = useMemo(
    () => (selectedServerId ? endpoints[selectedServerId] ?? [] : []),
    [endpoints, selectedServerId],
  )

  const selectedEndpoint = useMemo(
    () => serverEndpoints.find((ep) => ep.id === selectedEndpointId) ?? null,
    [serverEndpoints, selectedEndpointId],
  )

  const isSelectedServerRunning = useMemo(
    () =>
      selectedServerId
        ? runningServers.some((r) => r.server_id === selectedServerId)
        : false,
    [runningServers, selectedServerId],
  )

  const [messages, setMessages] = useState<AIMessage[]>([])
  const [status, setStatus] = useState<AIStatus>('idle')
  const [streamingContent, setStreamingContent] = useState('')
  const [toolActivities, setToolActivities] = useState<AIToolActivity[]>([])
  const [streamingReasoning, setStreamingReasoning] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pendingConfirm, setPendingConfirm] = useState<AIConfirmAction | null>(null)

  const continueState = usePendingContinue()

  const settingsMode = useSettingsStore((s) => s.getAiModeForApp('mockserver'))
  const [sessionModeOverride, setSessionModeOverride] = useState<AgentMode | null>(null)
  const activeMode = sessionModeOverride ?? settingsMode
  const activeModeRef = useLatestRef(activeMode)

  // ── Persistent history via shared hook ─────────────────────
  const history = useAIAssistantHistory('mockserver')

  // ── Model selection (per-app override → global default) ────
  const { selectedModelId, onModelChange } =
    useAIPanelModelSelection(MOCKSERVER_PANEL_APP_ID)

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
    const parts: string[] = []

    parts.push(`## Mock Server Context`)
    parts.push(
      `- **Running servers:** ${runningServers.length}${
        runningServers.length > 0
          ? ` (${runningServers
              .map((r) => `${r.name} :${r.port}`)
              .join(', ')})`
          : ''
      }`,
    )

    if (selectedProject) {
      parts.push(`- **Selected project:** ${selectedProject.name}`)
    }

    if (selectedServer) {
      parts.push(`\n## Selected Server: ${selectedServer.name}`)
      parts.push(`- **ID:** ${selectedServer.id}`)
      parts.push(`- **Port:** ${selectedServer.port}`)
      parts.push(
        `- **State:** ${isSelectedServerRunning ? 'running' : 'stopped'}`,
      )
      parts.push(`- **Endpoints:** ${serverEndpoints.length}`)

      if (serverEndpoints.length > 0) {
        const epStr = serverEndpoints
          .slice(0, 25)
          .map(
            (ep) =>
              `  - [${ep.method}] ${ep.path} → ${ep.status_code} (${ep.response_type}${ep.is_active ? '' : ', inactive'}) {id: ${ep.id}}`,
          )
          .join('\n')
        parts.push(`- **Endpoint list:**\n${epStr}`)
        if (serverEndpoints.length > 25) {
          parts.push(`  - … and ${serverEndpoints.length - 25} more`)
        }
      }
    } else {
      parts.push(`- **Selected server:** none`)
    }

    if (selectedEndpoint) {
      parts.push(`\n## Selected Endpoint`)
      parts.push(`- **ID:** ${selectedEndpoint.id}`)
      parts.push(`- **Method:** ${selectedEndpoint.method}`)
      parts.push(`- **Path:** ${selectedEndpoint.path}`)
      parts.push(`- **Status code:** ${selectedEndpoint.status_code}`)
      parts.push(`- **Response type:** ${selectedEndpoint.response_type}`)
      if (selectedEndpoint.response_type === 'ai' && selectedEndpoint.ai_prompt) {
        const promptPreview =
          selectedEndpoint.ai_prompt.length > 500
            ? selectedEndpoint.ai_prompt.slice(0, 500) + '… (truncated)'
            : selectedEndpoint.ai_prompt
        parts.push(`- **AI prompt:** ${promptPreview}`)
      }
    }

    return `\n\n--- CONTEXT ---\n${parts.join('\n')}\n--- END CONTEXT ---`
  }, [
    runningServers,
    selectedProject,
    selectedServer,
    serverEndpoints,
    selectedEndpoint,
    isSelectedServerRunning,
  ])

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
          `Mock Server AI: ${selectedServer?.name ?? 'Chat'}`,
          now,
          now,
          {
            id: userMsg.id,
            role: 'user',
            content: text,
            timestamp: now,
          },
        )

        // Build system prompt with mock-server context
        const fullSystemPrompt = buildModeAwareSystemPrompt(
          buildMockServerSystemPrompt() + buildContextString(),
          activeMode,
        )
        const conversationHistory = buildConversationHistory()
        // Remove the last message (the one we just added) — runner re-adds it.
        conversationHistory.pop()

        await runMockServerAI(
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
          { mode: activeModeRef.current, model: getMockServerModel() },
        )
      } catch (err) {
        setStatus('idle')
        setError(
          err instanceof Error ? err.message : 'An unexpected error occurred',
        )
      }
    },
    [
      selectedServer,
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
      contextItems: selectedServer
        ? [
            {
              id: selectedServer.id,
              label: selectedServer.name,
              sublabel: `:${selectedServer.port}${
                isSelectedServerRunning ? ' · running' : ' · stopped'
              }`,
              icon: Server,
            } satisfies AIContextItem,
          ]
        : [],
      emptyState: selectedServer
        ? {
            title: 'Ask AI about your mock server',
            suggestions: [
              '"Add a GET /users endpoint returning a list"',
              '"Start this server"',
              '"Why did the last request return a 404?"',
              '"Create an AI endpoint that returns fake products"',
            ],
          }
        : {
            title: 'Ask AI anything about mock servers',
            suggestions: [
              '"Create a server called Auth Mock on a free port"',
              '"List my mock servers and which are running"',
              '"Suggest a free port"',
              '"Stop all running servers"',
            ],
          },
      placeholder: selectedServer
        ? 'Ask about — or act on — this server…'
        : 'Ask anything about mock servers…',
      modes: AGENT_MODES,
      selectedMode: activeMode,
      selectedModelId,
      appId: 'mockserver',
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
      selectedServer,
      isSelectedServerRunning,
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
