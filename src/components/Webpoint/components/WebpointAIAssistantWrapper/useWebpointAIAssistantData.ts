import { useCallback, useMemo } from 'react'

import type { WebpointAIMessage } from '@/components/Webpoint/ai/types'
import type {
  AIAssistantPanelActions,
  AIAssistantPanelData,
  AIContextItem,
  AIEmptyStateConfig,
  AIMessage,
  AISession,
  AIStatus,
  AIToolActivity,
} from '@/right-panels/AIAssistantPanel'
import { useAIPanelModelSelection } from '@/right-panels/AIAssistantPanel'
import { useWebpointAIStore } from '@/store/webpoint-ai-store'
import { useWebpointStore } from '@/store/webpoint-store'

const WEBPOINT_PANEL_APP_ID = 'webpoint'

/** Stable empty references — the AI panel re-renders on identity changes. */
const NO_WP_MESSAGES: WebpointAIMessage[] = []
const NO_TOOL_ACTIVITIES: AIToolActivity[] = []
const NO_SESSIONS: AISession[] = []
const NO_CONTEXT_ITEMS: AIContextItem[] = []

const NOOP = (): void => {}

const WEBPOINT_PLACEHOLDER =
  'Ask me to generate a deck or change the current slide…'

const WEBPOINT_EMPTY_STATE: AIEmptyStateConfig = {
  title: 'Build or edit your deck with AI',
  suggestions: [
    'Create a 5-slide intro to our Q3 plan',
    'Add a slide summarizing the key risks',
    'Rewrite the current slide to be more concise',
  ],
}

interface WebpointAIAssistantReturn {
  data: AIAssistantPanelData
  actions: AIAssistantPanelActions
}

/**
 * Adapts WebPoint's bespoke `useWebpointAIStore` (per-presentation messages +
 * slide-gen pipeline) onto the shared right-panel AI Assistant
 * `data`/`actions` contract. The slide-gen flow (generate → parse → apply) is
 * untouched — this hook only maps state for rendering.
 */
export function useWebpointAIAssistantData(): WebpointAIAssistantReturn {
  const activePresentationId = useWebpointStore((s) => s.activePresentationId)
  const messagesByPresentation = useWebpointAIStore(
    (s) => s.messagesByPresentation,
  )
  const isStreaming = useWebpointAIStore((s) => s.isStreaming)
  const activity = useWebpointAIStore((s) => s.activity)

  const storeSendMessage = useWebpointAIStore((s) => s.sendMessage)
  const storeStop = useWebpointAIStore((s) => s.stop)
  const storeClear = useWebpointAIStore((s) => s.clear)

  const { selectedModelId, onModelChange } = useAIPanelModelSelection(
    WEBPOINT_PANEL_APP_ID,
  )

  const rawMessages = activePresentationId
    ? (messagesByPresentation[activePresentationId] ?? NO_WP_MESSAGES)
    : NO_WP_MESSAGES

  // Map WebPoint messages → shared `AIMessage`. Drop the in-flight empty
  // assistant placeholder so the panel shows its own thinking indicator
  // (WebPoint streams hidden JSON, never visible tokens).
  const messages = useMemo<AIMessage[]>(
    () =>
      rawMessages
        .filter(
          (m) =>
            !(
              m.role === 'assistant' &&
              m.status === 'streaming' &&
              m.content.trim() === ''
            ),
        )
        .map((m) => ({ id: m.id, role: m.role, content: m.content })),
    [rawMessages],
  )

  // Surface the slide-gen activity label as a single running tool activity so it
  // renders via the panel's `latestActivityLabel`.
  const toolActivities = useMemo<AIToolActivity[]>(() => {
    if (isStreaming && activity) {
      return [{ toolName: 'webpoint', label: activity, status: 'running' }]
    }
    return NO_TOOL_ACTIVITIES
  }, [isStreaming, activity])

  const status: AIStatus = isStreaming ? 'executing' : 'idle'

  const clearActive = useCallback(() => {
    const presId = useWebpointStore.getState().activePresentationId
    if (presId) storeClear(presId)
  }, [storeClear])

  const data = useMemo<AIAssistantPanelData>(
    () => ({
      messages,
      status,
      streamingContent: '',
      toolActivities,
      error: null,
      pendingConfirm: null,
      sessions: NO_SESSIONS,
      activeSessionId: null,
      contextItems: NO_CONTEXT_ITEMS,
      emptyState: WEBPOINT_EMPTY_STATE,
      placeholder: WEBPOINT_PLACEHOLDER,
      selectedModelId,
      appId: WEBPOINT_PANEL_APP_ID,
    }),
    [messages, status, toolActivities, selectedModelId],
  )

  const actions = useMemo<AIAssistantPanelActions>(
    () => ({
      sendMessage: (text: string) => {
        void storeSendMessage(text)
      },
      onStop: () => storeStop(),
      resetSession: clearActive,
      createSession: clearActive,
      confirmAction: NOOP,
      cancelAction: NOOP,
      selectSession: NOOP,
      removeSession: NOOP,
      clearAllSessions: NOOP,
      onModeChange: NOOP,
      loadMoreMessages: NOOP,
      onModelChange,
    }),
    [storeSendMessage, storeStop, clearActive, onModelChange],
  )

  return { data, actions }
}
