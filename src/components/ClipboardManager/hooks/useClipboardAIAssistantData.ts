import { useState, useCallback, useMemo, useRef, useEffect } from 'react'

import type {
  AIAssistantPanelData,
  AIAssistantPanelActions,
  AIMessage,
  AIStatus,
  AIToolActivity,
  AIConfirmAction,
} from '@/right-panels/AIAssistantPanel'
import { useAIAssistantHistory, useActionResolution, useAIPanelModelSelection, usePendingContinue } from '@/right-panels/AIAssistantPanel'
import { resolveAppModel } from '@/lib/resolveAppModel'
import { useSettingsStore } from '@/store/settings-store'
import { AGENT_MODES, type AgentMode } from '@/components/Chat/components/AgentModeSelector'
import { buildModeAwareSystemPrompt } from '@/lib/buildModeAwareSystemPrompt'
import { isAutoApproveAgentMode } from '@/lib/ai-assistant-auto-approve'
import { useLatestRef } from '@/hooks/useLatestRef'

import { runClipboardAI } from '../ai/runner'
import { buildClipboardSystemPrompt } from '@/prompts/clipboardManagerSystemPrompt'
import {
  CLIPBOARD_READ_DEFINITIONS,
  CLIPBOARD_ACTION_DEFINITIONS,
  CLIPBOARD_LABEL_DEFINITIONS,
  CLIPBOARD_AI_DEFINITIONS,
} from '@/ai/tools/clipboard'
import { mapToolDefinitionsToInfo } from '../utils/mapToolDefinitionsToInfo'

interface ClipboardAIAssistantReturn {
  data: AIAssistantPanelData
  actions: AIAssistantPanelActions
}

export function useClipboardAIAssistantData(): ClipboardAIAssistantReturn {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [status, setStatus] = useState<AIStatus>('idle')
  const [streamingContent, setStreamingContent] = useState('')
  const [toolActivities, setToolActivities] = useState<AIToolActivity[]>([])
  const [streamingReasoning, setStreamingReasoning] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pendingConfirm, setPendingConfirm] = useState<AIConfirmAction | null>(null)

  const continueState = usePendingContinue()

  const settingsMode = useSettingsStore((s) => s.getAiModeForApp('clipboard'))
  const [sessionModeOverride, setSessionModeOverride] = useState<AgentMode | null>(null)
  const activeMode = sessionModeOverride ?? settingsMode
  const activeModeRef = useLatestRef(activeMode)

  const history = useAIAssistantHistory('clipboard')

  const { selectedModelId, onModelChange } = useAIPanelModelSelection('clipboard')

  const clipboardToolsInfo = useMemo(
    () => [
      ...mapToolDefinitionsToInfo(CLIPBOARD_READ_DEFINITIONS, 'Read'),
      ...mapToolDefinitionsToInfo(CLIPBOARD_ACTION_DEFINITIONS, 'Actions'),
      ...mapToolDefinitionsToInfo(CLIPBOARD_LABEL_DEFINITIONS, 'Labels'),
      ...mapToolDefinitionsToInfo(CLIPBOARD_AI_DEFINITIONS, 'AI-Powered'),
    ],
    [],
  )

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
        await window.api.appendChatMessage(convId, 'Clipboard AI', now, now, {
          id: userMsg.id,
          role: 'user',
          content: text,
          timestamp: now,
        })

        const systemPrompt = buildModeAwareSystemPrompt(buildClipboardSystemPrompt(), activeMode)
        const conversationHistory = buildConversationHistory()
        // Remove the last message since runner adds it
        conversationHistory.pop()

        await runClipboardAI(systemPrompt, conversationHistory, text, {
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
        }, { mode: activeModeRef.current, model: resolveAppModel('clipboard') })
      } catch (err) {
        setStatus('idle')
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      }
    },
    [history, buildConversationHistory, activeMode],
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
      contextItems: [],
      emptyState: {
        title: 'Ask AI about your clipboard',
        suggestions: [
          '"What\'s in my clipboard?"',
          '"Find text I copied about APIs"',
          '"Label all code snippets"',
          '"Clear old unpinned items"',
        ],
      },
      placeholder: 'Ask about your clipboard…',
      modes: AGENT_MODES,
      selectedMode: activeMode,
      selectedModelId,
      appId: 'clipboard',
      toolsInfo: clipboardToolsInfo,
      isLoadingHistory: history.isLoadingHistory,
      isLoadingMessages: history.isLoadingMessages,
      hasMoreMessages: history.hasMoreMessages,
      resolvedActionMessageIds,
      resolvedActionByMessageId,
    }),
    [messages, status, streamingContent, toolActivities, streamingReasoning, error, pendingConfirm,
     continueState.pendingContinue,
     history.sessions, history.activeSessionId, history.isLoadingHistory,
     history.isLoadingMessages, history.hasMoreMessages, activeMode, selectedModelId,
     resolvedActionMessageIds, resolvedActionByMessageId, clipboardToolsInfo],
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
