import { useState, useCallback, useEffect, useRef } from 'react'

import type { AIMessage, AISession } from './AIAssistantPanel.types'
import {
  fetchAIAssistantSessions,
  type AIAssistantSessionMeta,
} from './api/fetchAIAssistantSessions'
import { saveAIAssistantSession } from './api/saveAIAssistantSession'
import { removeAIAssistantSession } from './api/removeAIAssistantSession'
import { clearAIAssistantSessions } from './api/clearAIAssistantSessions'
import { fetchConversationMessages } from './api/fetchConversationMessages'
import { mapPersistedMessage } from './api/mapPersistedMessage'

const MESSAGES_PAGE_SIZE = 50

interface CachedMessages {
  messages: AIMessage[]
  hasMore: boolean
}

export interface AIAssistantHistoryReturn {
  sessions: AISession[]
  activeSessionId: string | null
  isLoadingHistory: boolean
  isLoadingMessages: boolean
  hasMoreMessages: boolean
  historicalMessages: AIMessage[]
  getConversationId: (sessionId: string) => string | null
  saveCurrentSession: (
    conversationId: string,
    title: string,
    sessionId?: string,
  ) => void
  selectSession: (sessionId: string) => void
  removeSession: (sessionId: string) => void
  clearAllSessions: (preserveSessionId?: string) => void
  loadMoreMessages: () => void
  registerSessionConversation: (
    sessionId: string,
    conversationId: string,
  ) => void
}

export function useAIAssistantHistory(
  appId: string,
  scopeKey?: string,
): AIAssistantHistoryReturn {
  const [sessions, setSessions] = useState<AISession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [historicalMessages, setHistoricalMessages] = useState<AIMessage[]>([])
  const [hasMoreMessages, setHasMoreMessages] = useState(false)

  // Map sessionId -> conversationId for DB lookups
  const sessionConvMapRef = useRef<Map<string, string>>(new Map())
  // LRU-style cache for loaded messages
  const messagesCacheRef = useRef<Map<string, CachedMessages>>(new Map())

  // ── Load session list on mount ─────────────────────────────

  useEffect(() => {
    let cancelled = false

    fetchAIAssistantSessions(appId, scopeKey)
      .then((metas) => {
        if (cancelled) return
        const mapped: AISession[] = metas.map((m) => ({
          id: m.id,
          title: m.title,
          updatedAt: m.updatedAt,
          status: 'idle' as const,
        }))

        // Replace all state for the new (appId, scopeKey) scope so switching
        // scope (e.g. selecting a different PR) never mixes in another scope's
        // sessions, open conversation, or cached messages.
        setSessions(mapped)
        setActiveSessionId(null)
        setHistoricalMessages([])
        setHasMoreMessages(false)
        sessionConvMapRef.current = new Map(
          metas.map((m): [string, string] => [m.id, m.conversationId]),
        )
        messagesCacheRef.current.clear()
      })
      .catch((err) => {
        console.error('[AIAssistantHistory] Failed to load sessions:', err)
      })
      .finally(() => {
        if (!cancelled) setIsLoadingHistory(false)
      })

    return () => {
      cancelled = true
    }
  }, [appId, scopeKey])

  // ── Register a conversation ID for a session ──────────────

  const registerSessionConversation = useCallback(
    (sessionId: string, conversationId: string) => {
      sessionConvMapRef.current.set(sessionId, conversationId)
    },
    [],
  )

  // ── Get conversation ID for a session ─────────────────────

  const getConversationId = useCallback(
    (sessionId: string): string | null => {
      return sessionConvMapRef.current.get(sessionId) ?? null
    },
    [],
  )

  // ── Save / upsert session metadata ────────────────────────

  const saveCurrentSession = useCallback(
    (conversationId: string, title: string, sessionId?: string) => {
      const id = sessionId ?? crypto.randomUUID()
      const now = new Date().toISOString()

      sessionConvMapRef.current.set(id, conversationId)

      const truncatedTitle =
        title.length > 40 ? title.slice(0, 40) + '…' : title

      setSessions((prev) => {
        const existing = prev.find((s) => s.id === id)
        if (existing) {
          return prev.map((s) =>
            s.id === id
              ? { ...s, title: truncatedTitle, updatedAt: now }
              : s,
          )
        }
        return [
          {
            id,
            title: truncatedTitle,
            updatedAt: now,
            status: 'idle' as const,
          },
          ...prev,
        ]
      })

      const meta: AIAssistantSessionMeta = {
        id,
        appId,
        scopeKey,
        conversationId,
        title: truncatedTitle,
        createdAt: now,
        updatedAt: now,
      }
      saveAIAssistantSession(meta).catch((err) => {
        console.error('[AIAssistantHistory] Failed to save session:', err)
      })

      return id
    },
    [appId, scopeKey],
  )

  // ── Select a session (lazy-load messages) ─────────────────

  const selectSession = useCallback(
    (sessionId: string) => {
      if (sessionId === activeSessionId) return
      setActiveSessionId(sessionId)

      // Check cache first
      const cached = messagesCacheRef.current.get(sessionId)
      if (cached) {
        setHistoricalMessages(cached.messages)
        setHasMoreMessages(cached.hasMore)
        return
      }

      const convId = sessionConvMapRef.current.get(sessionId)
      if (!convId) {
        setHistoricalMessages([])
        setHasMoreMessages(false)
        return
      }

      setIsLoadingMessages(true)
      fetchConversationMessages(convId, null, MESSAGES_PAGE_SIZE)
        .then((page) => {
          const mapped: AIMessage[] = page.messages.map(mapPersistedMessage)
          setHistoricalMessages(mapped)
          setHasMoreMessages(page.hasMore)
          messagesCacheRef.current.set(sessionId, {
            messages: mapped,
            hasMore: page.hasMore,
          })
        })
        .catch((err) => {
          console.error(
            '[AIAssistantHistory] Failed to load messages:',
            err,
          )
          setHistoricalMessages([])
          setHasMoreMessages(false)
        })
        .finally(() => {
          setIsLoadingMessages(false)
        })
    },
    [activeSessionId],
  )

  // ── Load more (older) messages ────────────────────────────

  const loadMoreMessages = useCallback(() => {
    if (!activeSessionId || isLoadingMessages || !hasMoreMessages) return

    const convId = sessionConvMapRef.current.get(activeSessionId)
    if (!convId) return

    // Find the lowest sortOrder we currently have
    const cached = messagesCacheRef.current.get(activeSessionId)
    if (!cached) return

    // We need sortOrder info — fetch using a cursor.
    // The messages are in ascending order so the first message is oldest.
    // We pass beforeSortOrder based on current earliest message count.
    const currentCount = cached.messages.length

    setIsLoadingMessages(true)
    fetchConversationMessages(convId, currentCount > 0 ? currentCount : null, MESSAGES_PAGE_SIZE)
      .then((page) => {
        if (page.messages.length === 0) {
          setHasMoreMessages(false)
          return
        }
        const mapped: AIMessage[] = page.messages.map(mapPersistedMessage)
        const merged = [...mapped, ...cached.messages]
        setHistoricalMessages(merged)
        setHasMoreMessages(page.hasMore)
        messagesCacheRef.current.set(activeSessionId, {
          messages: merged,
          hasMore: page.hasMore,
        })
      })
      .catch((err) => {
        console.error(
          '[AIAssistantHistory] Failed to load more messages:',
          err,
        )
      })
      .finally(() => {
        setIsLoadingMessages(false)
      })
  }, [activeSessionId, isLoadingMessages, hasMoreMessages])

  // ── Remove a single session ───────────────────────────────

  const removeSession = useCallback(
    (sessionId: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      sessionConvMapRef.current.delete(sessionId)
      messagesCacheRef.current.delete(sessionId)

      if (sessionId === activeSessionId) {
        setActiveSessionId(null)
        setHistoricalMessages([])
        setHasMoreMessages(false)
      }

      removeAIAssistantSession(sessionId).catch((err) => {
        console.error(
          '[AIAssistantHistory] Failed to remove session:',
          err,
        )
      })
    },
    [activeSessionId],
  )

  // ── Clear all sessions ────────────────────────────────────

  const clearAllSessions = useCallback((preserveSessionId?: string) => {
    const keepId =
      preserveSessionId && sessionConvMapRef.current.has(preserveSessionId)
        ? preserveSessionId
        : undefined

    if (keepId) {
      // Preserve the currently active session: keep its list entry, its
      // conversation mapping and any cached messages. Drop everything else.
      setSessions((prev) => prev.filter((s) => s.id === keepId))

      const keepConvId = sessionConvMapRef.current.get(keepId)
      sessionConvMapRef.current.clear()
      if (keepConvId) sessionConvMapRef.current.set(keepId, keepConvId)

      const keepCache = messagesCacheRef.current.get(keepId)
      messagesCacheRef.current.clear()
      if (keepCache) messagesCacheRef.current.set(keepId, keepCache)

      // Only reset the active view if the preserved session is not the one
      // currently open.
      setActiveSessionId((prev) => {
        if (prev === keepId) return prev
        setHistoricalMessages([])
        setHasMoreMessages(false)
        return null
      })
    } else {
      setSessions([])
      sessionConvMapRef.current.clear()
      messagesCacheRef.current.clear()
      setActiveSessionId(null)
      setHistoricalMessages([])
      setHasMoreMessages(false)
    }

    clearAIAssistantSessions(appId, scopeKey, keepId).catch((err) => {
      console.error(
        '[AIAssistantHistory] Failed to clear sessions:',
        err,
      )
    })
  }, [appId, scopeKey])

  return {
    sessions,
    activeSessionId,
    isLoadingHistory,
    isLoadingMessages,
    hasMoreMessages,
    historicalMessages,
    getConversationId,
    saveCurrentSession,
    selectSession,
    removeSession,
    clearAllSessions,
    loadMoreMessages,
    registerSessionConversation,
  }
}
