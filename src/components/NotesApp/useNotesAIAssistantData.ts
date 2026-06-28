import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { BookOpen, FileText, Folders } from 'lucide-react'

import { DEFAULT_PANEL_AI_CONFIG } from '@/store/panel-ai-config.constants'
import type {
  AIAssistantPanelData,
  AIAssistantPanelActions,
  AIContextItem,
  AIContextScope,
  AIMessage,
  AIStatus,
  AIToolActivity,
} from '@/right-panels/AIAssistantPanel'
import { useAIAssistantHistory, useActionResolution, useAIPanelModelSelection } from '@/right-panels/AIAssistantPanel'
import { resolveAppModel } from '@/lib/resolveAppModel'
import { useNotesAppStore } from '@/store/notes-app-store'
import { useNotesStore, type Note } from '@/store/notes-store'
import { useNoteNotebooksStore, type NoteNotebook } from '@/store/note-notebooks-store'
import { useNoteSectionsStore } from '@/store/note-sections-store'
import { useNoteTopicsStore } from '@/store/note-topics-store'
import { useNoteProjectsStore } from '@/store/note-projects-store'
import { useSettingsStore } from '@/store/settings-store'
import { AGENT_MODES, type AgentMode } from '@/components/Chat/components/AgentModeSelector'
import { buildModeAwareSystemPrompt } from '@/lib/buildModeAwareSystemPrompt'
import { describeToolActivity } from '@/ai/tools/describeToolActivity'
import { useNotesToc } from './NotesTocProvider'

const NOOP = (): void => {}
const EMPTY_NOTES: Note[] = []
const EMPTY_NOTEBOOKS: NoteNotebook[] = []

type NotesContextScope = 'page' | 'notebook' | 'project'

const SYSTEM_PROMPT = `You are a helpful AI writing assistant for a notes app. You help users write, edit, summarize, expand, and improve their notes.
Answer questions using the provided context (note content, notebook/section/topic info). Be concise and helpful.
Format your responses in Markdown when appropriate.

To help the user understand a note in depth and remember it, you can produce VISUALS that render inline:
- A \`\`\`mermaid fenced block (flowchart, mindmap, sequence, timeline, or graph) to visualize structure, steps, or relationships.
- A \`\`\`chart fenced block whose body is valid JSON of exactly this shape for quantitative comparisons:
  { "type": "bar" | "line" | "area" | "pie", "title"?: string, "data": [ { ... } ], "xKey"?: string, "series"?: [ { "key": string, "name"?: string, "color"?: string } ], "nameKey"?: string, "valueKey"?: string, "colors"?: string[] }
  For bar/line/area set "xKey" and a non-empty "series"; for pie use "data" items like { "name", "value" }.
Choose the single visual that best aids understanding and retention, keep the JSON valid, and briefly explain the visual in prose. The user can insert these visuals directly into their note.`

interface NotesAIAssistantReturn {
  data: AIAssistantPanelData
  actions: AIAssistantPanelActions
}

export function useNotesAIAssistantData(): NotesAIAssistantReturn {
  const selectedNoteId = useNotesAppStore((s) => s.selectedNoteId)
  const selectedNotebookIdFromApp = useNotesAppStore((s) => s.selectedNotebookId)
  const selectedProjectIdFromApp = useNotesAppStore((s) => s.selectedProjectId)
  const notes = useNotesStore((s) => s.notesByScope['notes-app::global::all'] ?? EMPTY_NOTES)
  const notebooks = useNoteNotebooksStore((s) => s.notebooks)
  const sections = useNoteSectionsStore((s) => s.sections)
  const topics = useNoteTopicsStore((s) => s.topics)
  const projects = useNoteProjectsStore((s) => s.projects)

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId) ?? null,
    [notes, selectedNoteId]
  )

  // Notebook the user is currently focused on. Prefer the notebook of the
  // open page; fall back to an explicitly tracked `selectedNotebookId` from
  // the app store (set when no page is open but a notebook is the user's
  // active context).
  const activeNotebookId = selectedNote?.notebookId ?? selectedNotebookIdFromApp ?? null
  const activeNotebook = useMemo(
    () => (activeNotebookId ? notebooks.find((n) => n.id === activeNotebookId) ?? null : null),
    [notebooks, activeNotebookId]
  )
  const notebookPages = useMemo(
    () =>
      activeNotebookId
        ? notes.filter((n) => n.notebookId === activeNotebookId && !n.isTrashed)
        : EMPTY_NOTES,
    [notes, activeNotebookId]
  )

  // Project the user is currently focused on. Prefer the project of the
  // active notebook (derived from the open page); otherwise fall back to
  // the app store's `selectedProjectId`.
  const activeProjectId = activeNotebook?.projectId ?? selectedProjectIdFromApp ?? null
  const activeProject = useMemo(
    () => (activeProjectId ? projects.find((p) => p.id === activeProjectId) ?? null : null),
    [projects, activeProjectId]
  )
  const projectNotebooks = useMemo(
    () =>
      activeProjectId
        ? notebooks.filter((n) => n.projectId === activeProjectId)
        : EMPTY_NOTEBOOKS,
    [notebooks, activeProjectId]
  )
  const projectNotebookIds = useMemo(
    () => new Set(projectNotebooks.map((n) => n.id)),
    [projectNotebooks]
  )
  const projectPages = useMemo(
    () =>
      activeProjectId
        ? notes.filter((n) => !n.isTrashed && n.notebookId !== null && projectNotebookIds.has(n.notebookId))
        : EMPTY_NOTES,
    [notes, activeProjectId, projectNotebookIds]
  )

  // ── Context scope (page → notebook → project) ────────────
  // Default: most-specific available scope. A `userOverrodeScopeRef`
  // makes explicit user toggles sticky so they survive opening/closing
  // pages within the same notebook/project.
  const pickDefaultScope = useCallback(
    (hasPage: boolean, hasNotebook: boolean, hasProject: boolean): NotesContextScope => {
      if (hasPage) return 'page'
      if (hasNotebook) return 'notebook'
      if (hasProject) return 'project'
      return 'page'
    },
    []
  )
  const [contextScope, setContextScope] = useState<NotesContextScope>(() =>
    pickDefaultScope(!!selectedNote, !!activeNotebookId, !!activeProjectId)
  )
  const userOverrodeScopeRef = useRef(false)
  const lastActiveProjectIdRef = useRef<string | null>(activeProjectId)
  const lastActiveNotebookIdRef = useRef<string | null>(activeNotebookId)

  // Reset overrides + default scope when the project or notebook changes.
  useEffect(() => {
    const projectChanged = lastActiveProjectIdRef.current !== activeProjectId
    const notebookChanged = lastActiveNotebookIdRef.current !== activeNotebookId
    if (projectChanged || notebookChanged) {
      lastActiveProjectIdRef.current = activeProjectId
      lastActiveNotebookIdRef.current = activeNotebookId
      userOverrodeScopeRef.current = false
      setContextScope(
        pickDefaultScope(!!selectedNote, !!activeNotebookId, !!activeProjectId)
      )
    }
  }, [activeProjectId, activeNotebookId, selectedNote, pickDefaultScope])

  // Force scope down to the next-available level if the current scope
  // becomes unreachable (e.g. user closed the page while on 'page' scope).
  useEffect(() => {
    if (contextScope === 'page' && !selectedNote) {
      if (activeNotebookId) setContextScope('notebook')
      else if (activeProjectId) setContextScope('project')
    } else if (contextScope === 'notebook' && !activeNotebookId) {
      if (activeProjectId) setContextScope('project')
      else if (selectedNote) setContextScope('page')
    } else if (contextScope === 'project' && !activeProjectId) {
      if (activeNotebookId) setContextScope('notebook')
      else if (selectedNote) setContextScope('page')
    }
  }, [contextScope, selectedNote, activeNotebookId, activeProjectId])

  const [messages, setMessages] = useState<AIMessage[]>([])
  const [status, setStatus] = useState<AIStatus>('idle')
  const [streamingContent, setStreamingContent] = useState('')
  const [toolActivities, setToolActivities] = useState<AIToolActivity[]>([])
  const [streamingReasoning, setStreamingReasoning] = useState('')
  const [error, setError] = useState<string | null>(null)

  const settingsMode = useSettingsStore((s) => s.getAiModeForApp('notes'))
  const panelConfigPartial = useSettingsStore((s) => s.panelAIConfigs['notes'])
  const panelConfig = useMemo(() => ({ ...DEFAULT_PANEL_AI_CONFIG, ...panelConfigPartial }), [panelConfigPartial])
  const [sessionModeOverride, setSessionModeOverride] = useState<AgentMode | null>(null)
  const activeMode = sessionModeOverride ?? settingsMode

  const history = useAIAssistantHistory('notes')

  const { selectedModelId, onModelChange } = useAIPanelModelSelection('notes')

  const conversationIdRef = useRef<string | null>(null)
  const activeSessionIdRef = useRef<string | null>(null)
  const activeStreamIdRef = useRef<string | null>(null)
  const requestRef = useRef(0)
  const streamBufferRef = useRef('')
  const rafIdRef = useRef<number | null>(null)
  const messagesRef = useRef(messages)
  messagesRef.current = messages
  const historyRef = useRef(history)
  historyRef.current = history
  // Snapshot latest reasoning + tool activities so the stream-done
  // listener can persist the full thinking + tool trail.
  const toolActivitiesRef = useRef(toolActivities)
  toolActivitiesRef.current = toolActivities
  const streamingReasoningRef = useRef(streamingReasoning)
  streamingReasoningRef.current = streamingReasoning

  // Build context from selected note, whole notebook, or whole project
  // depending on scope.
  const buildContextString = useCallback((): string => {
    const sortPages = (pages: Note[]): Note[] =>
      pages.slice().sort((a, b) => {
        if (a.sectionId !== b.sectionId) {
          return (a.sectionId ?? '').localeCompare(b.sectionId ?? '')
        }
        if (a.topicId !== b.topicId) {
          return (a.topicId ?? '').localeCompare(b.topicId ?? '')
        }
        const ao = a.sortOrder ?? 0
        const bo = b.sortOrder ?? 0
        if (ao !== bo) return ao - bo
        return (a.updatedAt ?? '').localeCompare(b.updatedAt ?? '')
      })

    const formatPage = (page: Note): string => {
      const section = sections.find((s) => s.id === page.sectionId)
      const topic = topics.find((t) => t.id === page.topicId)
      const breadcrumb = [section?.name, topic?.name].filter(Boolean).join(' > ')
      const headerSuffix = page.id === selectedNoteId ? ' (currently open)' : ''
      const lines: string[] = []
      lines.push(`## ${page.title || 'Untitled'}${headerSuffix}`)
      if (breadcrumb) lines.push(`Location: ${breadcrumb}`)
      if (page.content) {
        lines.push('')
        lines.push(page.content)
      }
      lines.push('---')
      return lines.join('\n')
    }

    // ── Project scope ────────────────────────────────────
    if (contextScope === 'project' && activeProject) {
      const notebookCount = projectNotebooks.length
      const totalPages = projectPages.length
      if (notebookCount === 0 || totalPages === 0) {
        return `\n\n--- PROJECT CONTEXT (${activeProject.name}) \u2014 ${notebookCount} notebook${notebookCount === 1 ? '' : 's'}, 0 pages ---\n--- END CONTEXT ---`
      }

      const sortedNotebooks = projectNotebooks
        .slice()
        .sort(
          (a, b) =>
            (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
            (a.name ?? '').localeCompare(b.name ?? ''),
        )

      const notebookBlocks = sortedNotebooks.map((nb) => {
        const pagesInNotebook = sortPages(projectPages.filter((p) => p.notebookId === nb.id))
        const header = `### Notebook: ${nb.name} \u2014 ${pagesInNotebook.length} page${pagesInNotebook.length === 1 ? '' : 's'}`
        if (pagesInNotebook.length === 0) return `${header}\n_(empty)_`
        return [header, ...pagesInNotebook.map(formatPage)].join('\n')
      })

      return `\n\n--- PROJECT CONTEXT (${activeProject.name}) \u2014 ${notebookCount} notebook${notebookCount === 1 ? '' : 's'}, ${totalPages} page${totalPages === 1 ? '' : 's'} ---\n${notebookBlocks.join('\n\n')}\n--- END CONTEXT ---`
    }

    // ── Notebook scope ───────────────────────────────────
    if (contextScope === 'notebook' && activeNotebook) {
      const pages = sortPages(notebookPages)
      if (pages.length === 0) {
        return `\n\n--- NOTEBOOK CONTEXT (${activeNotebook.name}) \u2014 0 pages ---\n--- END CONTEXT ---`
      }
      return `\n\n--- NOTEBOOK CONTEXT (${activeNotebook.name}) \u2014 ${pages.length} page${pages.length === 1 ? '' : 's'} ---\n${pages.map(formatPage).join('\n')}\n--- END CONTEXT ---`
    }

    // ── Page scope (default / fallback) ──────────────────
    if (!selectedNote) return ''
    const parts: string[] = []

    const notebook = notebooks.find((n) => n.id === selectedNote.notebookId)
    const section = sections.find((s) => s.id === selectedNote.sectionId)
    const topic = topics.find((t) => t.id === selectedNote.topicId)

    const breadcrumb = [notebook?.name, section?.name, topic?.name].filter(Boolean).join(' > ')
    if (breadcrumb) parts.push(`Location: ${breadcrumb}`)
    if (selectedNote.title) parts.push(`Title: ${selectedNote.title}`)
    if (selectedNote.content) parts.push(`Content:\n${selectedNote.content}`)

    return parts.length > 0
      ? `\n\n--- NOTE CONTEXT ---\n${parts.join('\n\n')}\n--- END CONTEXT ---`
      : ''
  }, [contextScope, activeProject, projectNotebooks, projectPages, activeNotebook, notebookPages, selectedNote, selectedNoteId, notebooks, sections, topics])

  // Stream event listeners
  useEffect(() => {
    const unlistenChunk = window.api.onChatStreamChunk(
      (data: { streamId: string; token: string }) => {
        if (data.streamId !== activeStreamIdRef.current) return
        streamBufferRef.current += data.token
        if (rafIdRef.current === null) {
          rafIdRef.current = requestAnimationFrame(() => {
            rafIdRef.current = null
            setStreamingContent(streamBufferRef.current)
          })
        }
      }
    )

    const unlistenDone = window.api.onChatStreamDone(
      (data: { streamId: string }) => {
        if (data.streamId !== activeStreamIdRef.current) return
        const finalContent = streamBufferRef.current
        const snapshotReasoning = streamingReasoningRef.current
        const snapshotActivities = toolActivitiesRef.current
        activeStreamIdRef.current = null
        streamBufferRef.current = ''
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current)
          rafIdRef.current = null
        }
        setStreamingContent('')
        setStatus('idle')
        setToolActivities([])
        setStreamingReasoning('')
        if (finalContent) {
          const assistantMsg: AIMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant' as const,
            content: finalContent,
            ...(snapshotReasoning ? { reasoning: snapshotReasoning } : {}),
            ...(snapshotActivities.length > 0
              ? { activities: snapshotActivities }
              : {}),
          }
          setMessages((prev) => [...prev, assistantMsg])
          const convId = conversationIdRef.current
          if (convId) {
            const now = new Date().toISOString()
            window.api.appendChatMessage(convId, '', now, now, {
              id: assistantMsg.id,
              role: 'assistant',
              content: finalContent,
              timestamp: now,
              reasoning: snapshotReasoning || undefined,
              activitiesJson:
                snapshotActivities.length > 0
                  ? JSON.stringify(snapshotActivities)
                  : undefined,
            }).catch(() => {})
            const firstUserMsg = messagesRef.current.find((m) => m.role === 'user')?.content ?? 'Chat'
            historyRef.current.saveCurrentSession(convId, firstUserMsg, activeSessionIdRef.current ?? undefined)
          }
        }
      }
    )

    const unlistenError = window.api.onChatStreamError(
      (data: { streamId: string; error: string }) => {
        if (data.streamId !== activeStreamIdRef.current) return
        activeStreamIdRef.current = null
        streamBufferRef.current = ''
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current)
          rafIdRef.current = null
        }
        setStreamingContent('')
        setStatus('idle')
        setToolActivities([])
        setStreamingReasoning('')
        setError(data.error ?? 'An error occurred')
      }
    )

    const unlistenReasoning = window.api.onChatStreamReasoningChunk(
      (data: { streamId: string; token: string }) => {
        if (data.streamId !== activeStreamIdRef.current) return
        setStreamingReasoning((prev) => prev + data.token)
      }
    )

    const unlistenToolStart = window.api.onChatStreamToolStart(
      (data: { streamId: string; toolName: string; args?: unknown }) => {
        if (data.streamId !== activeStreamIdRef.current) return
        setToolActivities((prev) => [
          ...prev,
          {
            toolName: data.toolName,
            label: describeToolActivity(data.toolName, data.args),
            args: (data.args ?? undefined) as Record<string, unknown> | undefined,
            status: 'running',
          },
        ])
      }
    )

    const unlistenToolResult = window.api.onChatStreamToolResult(
      (data: { streamId: string; toolName: string; result?: string }) => {
        if (data.streamId !== activeStreamIdRef.current) return
        setToolActivities((prev) => {
          const next = [...prev]
          for (let i = next.length - 1; i >= 0; i--) {
            if (next[i].toolName === data.toolName && next[i].status === 'running') {
              next[i] = { ...next[i], status: 'done', result: data.result }
              return next
            }
          }
          return prev
        })
      }
    )

    return () => {
      unlistenChunk()
      unlistenDone()
      unlistenError()
      unlistenToolStart()
      unlistenToolResult()
      unlistenReasoning()
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current)
    }
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

      try {
        if (!conversationIdRef.current) conversationIdRef.current = crypto.randomUUID()
        if (!activeSessionIdRef.current) {
          activeSessionIdRef.current = crypto.randomUUID()
          history.registerSessionConversation(activeSessionIdRef.current, conversationIdRef.current)
        }
        const convId = conversationIdRef.current
        const now = new Date().toISOString()

        await window.api.appendChatMessage(convId, `Notes AI: ${selectedNote?.title ?? 'Chat'}`, now, now, {
          id: userMsg.id,
          role: 'user',
          content: text,
          timestamp: now,
        })

        const context = buildContextString()
        const fullSystemPrompt = buildModeAwareSystemPrompt(SYSTEM_PROMPT + context, activeMode)
        const streamId = crypto.randomUUID()
        activeStreamIdRef.current = streamId

        if (requestRef.current !== requestId) return

        await window.api.sendChatMessage({
          streamId,
          conversationId: convId,
          systemPrompt: fullSystemPrompt,
          model: resolveAppModel('notes'),
          enableTools: panelConfig.enableTools,
          maxTools: panelConfig.maxTools,
        })
      } catch (err) {
        activeStreamIdRef.current = null
        setStatus('idle')
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      }
    },
    [selectedNote, buildContextString, history, activeMode, panelConfig]
  )

  const clearActiveState = useCallback(() => {
    activeStreamIdRef.current = null
    streamBufferRef.current = ''
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
    conversationIdRef.current = null
    activeSessionIdRef.current = null
    setMessages([])
    setStatus('idle')
    setStreamingContent('')
    setError(null)
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
      activeStreamIdRef.current = null
      streamBufferRef.current = ''
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
      setStatus('idle')
      setStreamingContent('')
      setError(null)
      activeSessionIdRef.current = sessionId
      const convId = history.getConversationId(sessionId)
      conversationIdRef.current = convId
      history.selectSession(sessionId)
    },
    [messages, history]
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
    [history, clearActiveState]
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
    confirmAction: NOOP,
    pendingConfirm: null,
    status,
  })

  const onStop = useCallback(() => {
    requestRef.current++
    activeStreamIdRef.current = null
    streamBufferRef.current = ''
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
    setStreamingContent('')
    setStreamingReasoning('')
    setToolActivities((prev) =>
      prev.map((a) => (a.status === 'running' ? { ...a, status: 'done' as const } : a)),
    )
    setStatus('idle')
  }, [])

  // ── Derived chips shown above the composer ──────────────────────
  const contextItems: AIContextItem[] = useMemo(() => {
    if (contextScope === 'notebook' && activeNotebook) {
      const count = notebookPages.length
      return [
        {
          id: `notebook:${activeNotebook.id}`,
          type: 'context',
          label: activeNotebook.name || 'Notebook',
          sublabel: `${count} page${count === 1 ? '' : 's'}`,
          icon: BookOpen,
        },
      ]
    }
    if (contextScope === 'page' && selectedNote) {
      return [
        {
          id: `note:${selectedNote.id}`,
          type: 'context',
          label: selectedNote.title || 'Untitled',
          icon: FileText,
        },
      ]
    }
    return []
  }, [contextScope, activeNotebook, notebookPages, selectedNote])

  // ── Scope toggle (Page vs Notebook) ─────────────────────────
  const contextScopes: AIContextScope[] | undefined = useMemo(() => {
    if (!activeNotebookId) return undefined
    const scopes: AIContextScope[] = []
    scopes.push({
      id: 'page',
      label: 'Page',
      icon: FileText,
      description: 'Only the open page',
      disabled: !selectedNote,
    })
    scopes.push({
      id: 'notebook',
      label: 'Notebook',
      icon: BookOpen,
      description: 'All pages in this notebook',
    })
    return scopes
  }, [activeNotebookId, selectedNote])

  const onContextScopeChange = useCallback((scopeId: string) => {
    if (scopeId !== 'page' && scopeId !== 'notebook') return
    userOverrodeScopeRef.current = true
    setContextScope(scopeId)
  }, [])

  const emptyState = useMemo(() => {
    if (contextScope === 'notebook' && activeNotebook) {
      return {
        title: `Ask AI about “${activeNotebook.name}”`,
        suggestions: [
          '"Summarize this notebook"',
          '"What topics does this notebook cover?"',
          '"Find inconsistencies across pages"',
        ],
      }
    }
    return {
      title: 'Ask AI about this note',
      suggestions: [
        '"Summarize this note"',
        '"Explain this note with a diagram"',
        '"Visualize this note as a chart"',
        '"Fix grammar and improve"',
      ],
    }
  }, [contextScope, activeNotebook])

  const data: AIAssistantPanelData = useMemo(
    () => ({
      messages,
      status,
      streamingContent,
      toolActivities,
      streamingReasoning,
      error,
      pendingConfirm: null,
      sessions: history.sessions,
      activeSessionId: history.activeSessionId,
      contextItems,
      contextScopes,
      selectedContextScopeId: contextScope,
      emptyState,
      placeholder:
        contextScope === 'project' && activeProject
          ? `Ask about “${activeProject.name}”…`
          : contextScope === 'notebook' && activeNotebook
            ? `Ask about “${activeNotebook.name}”…`
            : 'Ask about this note…',
      modes: AGENT_MODES,
      selectedMode: activeMode,
      selectedModelId,
      appId: 'notes',
      isLoadingHistory: history.isLoadingHistory,
      isLoadingMessages: history.isLoadingMessages,
      hasMoreMessages: history.hasMoreMessages,
      resolvedActionMessageIds,
      resolvedActionByMessageId,
    }),
    [messages, status, streamingContent, toolActivities, streamingReasoning, error, history.sessions, history.activeSessionId, history.isLoadingHistory, history.isLoadingMessages, history.hasMoreMessages, contextItems, contextScopes, contextScope, emptyState, activeNotebook, activeProject, activeMode, selectedModelId, resolvedActionMessageIds, resolvedActionByMessageId]
  )

  const { editor } = useNotesToc()
  const onInsertToEditor = useCallback(
    (markdown: string) => {
      if (!editor || editor.isDestroyed) return
      const current = (
        editor.storage.markdown?.getMarkdown() as string | undefined
      )?.trim()
      const next = current ? `${current}\n\n${markdown}` : markdown
      editor.chain().focus().setContent(next, { emitUpdate: true }).run()
    },
    [editor],
  )

  const actions: AIAssistantPanelActions = useMemo(
    () => ({
      sendMessage: sendMessage as unknown as AIAssistantPanelActions['sendMessage'],
      confirmAction: NOOP,
      cancelAction: NOOP,
      onStop,
      resetSession,
      createSession,
      selectSession,
      removeSession,
      clearAllSessions,
      onModeChange: ((modeId: string) => setSessionModeOverride(modeId as AgentMode)) as AIAssistantPanelActions['onModeChange'],
      onModelChange,
      loadMoreMessages: history.loadMoreMessages,
      onActionClick,
      onContextScopeChange,
      onInsertToEditor,
    }),
    [sendMessage, onStop, resetSession, createSession, selectSession, removeSession, clearAllSessions, onModelChange, history.loadMoreMessages, onActionClick, onContextScopeChange, onInsertToEditor]
  )

  return { data, actions }
}
