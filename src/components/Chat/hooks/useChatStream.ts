import { useState, useRef, useEffect, useCallback } from 'react'

import { useChatHistoryStore } from '@/store/chat-history-store'
import { useSettingsStore } from '@/store/settings-store'
import { useCommandStore } from '@/store/command-store'
import { playCompletionChime } from '@/lib/audio-completion'
import { ASK_MODE_SYSTEM_PROMPT, PLAN_MODE_SYSTEM_PROMPT } from '../components/AgentModeSelector'
import { composeCoreSystemPrompt } from '@/prompts'
import { buildAutoContextBlock } from '@/lib/ai-context'
import { AI_PLAN_INSTRUCTION } from '@/lib/chat-ui'
import { extractCommands } from '../utils/parseCommands'
import { isLocallyExecutable } from '../utils/functionRegistry'
import { MARKDOWN_FORMATTING_INSTRUCTIONS } from '@/prompts/chatMarkdownFormattingInstructions'
import { buildWebAnalysisPrompt } from '@/prompts/chatWebAnalysisPrompt'

import type { ToolCallRecord } from '@/store/chat-history-store'

function buildSystemPrompt(
  userPrompt: string | undefined,
  agentMode?: string,
  autoApprove?: boolean,
): string {
  const base = userPrompt || 'You are a helpful assistant.'
  let modePrefix = ''
  if (agentMode === 'ask') modePrefix = ASK_MODE_SYSTEM_PROMPT
  else if (agentMode === 'plan') modePrefix = PLAN_MODE_SYSTEM_PROMPT

  // One-shot pre-authorization granted by the user clicking "Implement"
  // on an `ai-actions` directive. Appended only for the single run that
  // consumes the flag — the chat surface clears it as soon as sendMessage
  // returns.
  const autoApproveBlock = autoApprove
    ? `\n\n────────────────────────────────────────────────────────────
ACTION HANDOFF — PRE-AUTHORIZED EXECUTION
────────────────────────────────────────────────────────────

The user has just approved a plan from a previous turn via the "Implement"
action button. You have been pre-authorized for this run:

- Do NOT emit \`ai-questions\` of type \`"function_confirm"\` — call tools
  directly without staging a confirmation step.
- Do NOT emit a new \`ai-actions\` fence for this run — the user has
  already chosen to implement; another button row would be redundant.
- Execute all required tool calls (including destructive ones such as
  file writes, deletes, command execution) directly, step by step, until
  the plan is complete.
- If you genuinely need clarification on a NON-destructive decision the
  plan didn't cover, you may still ask via a regular \`ai-questions\`
  fence — but lean toward making reasonable defaults and continuing.
- Provide concise progress updates between tool calls so the user can
  follow along.\n`
    : ''

  return `${modePrefix}${composeCoreSystemPrompt()}\n\n${base}${autoApproveBlock}\n\n${MARKDOWN_FORMATTING_INSTRUCTIONS}\n${AI_PLAN_INSTRUCTION}\n${buildAutoContextBlock()}`
}

// ── URL-only detection ─────────────────────────────────────────────
const URL_ONLY_RE = /^https?:\/\/[^\s]+$/i

function isUrlOnly(content: string): boolean {
  return URL_ONLY_RE.test(content.trim())
}

export interface ToolCall {
  id: string
  toolName: string
  args: Record<string, unknown>
  result?: string
  status: 'running' | 'done'
  startedAt: string
  completedAt?: string
}

export interface CrawlNavLink {
  text: string
  href: string
}

export interface CrawlNavLinks {
  prev: CrawlNavLink | null
  next: CrawlNavLink | null
}

interface UseChatStreamReturn {
  isStreaming: boolean
  streamingContent: string
  error: string | null
  toolCalls: ToolCall[]
  preToolContent: string
  crawlNavLinks: CrawlNavLinks | null
  sendMessage: (content: string) => void
  stopStream: () => void
  /**
   * Pre-authorize the NEXT `sendMessage` invocation to run destructive
   * tool calls without `function_confirm` confirmations. Cleared
   * automatically after that one send fires (one-shot, fire-and-forget).
   * Use this when the user clicks "Implement" on an `ai-actions` row.
   */
  primeAutoApproveNextRun: () => void
}

export function useChatStream(): UseChatStreamReturn {
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([])
  const [crawlNavLinks, setCrawlNavLinks] = useState<CrawlNavLinks | null>(null)
  const [preToolContent, setPreToolContent] = useState('')
  const streamIdRef = useRef<string | null>(null)
  const contentRef = useRef('')
  const preToolContentRef = useRef('')
  const conversationIdRef = useRef<string | null>(null)
  const rafRef = useRef<number | null>(null)
  const pendingTokenRef = useRef(false)
  /** Tracks which backend was used so we know which abort to call */
  const usedResearchRef = useRef(false)
  /** Snapshot of tool calls at stream completion for persistence */
  const toolCallsRef = useRef<ToolCall[]>([])
  /**
   * One-shot flag set by `primeAutoApproveNextRun()`. Read & cleared
   * exactly once inside `sendMessage()` to inject the pre-authorization
   * system-prompt block for that single run.
   */
  const autoApproveNextRunRef = useRef(false)

  const addMessage = useChatHistoryStore((s) => s.addMessage)
  const saveToolCalls = useChatHistoryStore((s) => s.saveToolCalls)

  useEffect(() => {
    // ── Shared handler helpers ──────────────────────────────────

    const handleChunk = (streamId: string, token: string): void => {
      if (streamId !== streamIdRef.current) return
      contentRef.current += token
      // Batch updates via rAF for smooth rendering
      if (!pendingTokenRef.current) {
        pendingTokenRef.current = true
        rafRef.current = requestAnimationFrame(() => {
          setStreamingContent(contentRef.current)
          pendingTokenRef.current = false
        })
      }
    }

    const handleDone = (streamId: string): void => {
      if (streamId !== streamIdRef.current) return
      // Flush any pending rAF
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      pendingTokenRef.current = false

      setIsStreaming(false)
      const convId = conversationIdRef.current
      const assistantMessageId = crypto.randomUUID()
      if (contentRef.current && convId) {
        addMessage(convId, {
          id: assistantMessageId,
          role: 'assistant',
          content: contentRef.current,
          timestamp: new Date().toISOString(),
        })

        // Persist tool calls
        const currentToolCalls = toolCallsRef.current
        if (currentToolCalls.length > 0) {
          const records: ToolCallRecord[] = currentToolCalls.map((tc, i) => ({
            id: tc.id,
            messageId: assistantMessageId,
            conversationId: convId,
            toolName: tc.toolName,
            args: JSON.stringify(tc.args),
            result: tc.result ?? null,
            status: tc.status,
            startedAt: tc.startedAt,
            completedAt: tc.completedAt ?? null,
            sortOrder: i,
          }))
          saveToolCalls(records)
        }
      }
      contentRef.current = ''
      setStreamingContent('')
      setToolCalls([])
      toolCallsRef.current = []
      setPreToolContent('')
      preToolContentRef.current = ''
      streamIdRef.current = null
      playCompletionChime('success')
    }

    const handleError = (streamId: string, errMsg: string): void => {
      if (streamId !== streamIdRef.current) return
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      pendingTokenRef.current = false

      setIsStreaming(false)
      setError(errMsg)
      contentRef.current = ''
      setStreamingContent('')
      setToolCalls([])
      toolCallsRef.current = []
      setPreToolContent('')
      preToolContentRef.current = ''
      streamIdRef.current = null
      playCompletionChime('error')
    }

    const handleToolStart = (streamId: string, toolName: string, args: Record<string, unknown>): void => {
      if (streamId !== streamIdRef.current) return
      const tc: ToolCall = { id: crypto.randomUUID(), toolName, args, status: 'running', startedAt: new Date().toISOString() }
      setToolCalls((prev) => {
        // Snapshot pre-tool content on the first tool call
        if (prev.length === 0) {
          preToolContentRef.current = contentRef.current
          setPreToolContent(contentRef.current)
        }
        const next = [...prev, tc]
        toolCallsRef.current = next
        return next
      })
    }

    const handleToolResult = (streamId: string, toolName: string, result: string): void => {
      if (streamId !== streamIdRef.current) return
      const completedAt = new Date().toISOString()
      setToolCalls((prev) => {
        const next = prev.map((tc) =>
          tc.toolName === toolName && tc.status === 'running'
            ? { ...tc, result, status: 'done' as const, completedAt }
            : tc
        )
        toolCallsRef.current = next
        return next
      })
    }

    // ── Chat stream events ─────────────────────────────────────

    const cleanupChatChunk = window.api.onChatStreamChunk(
      ({ streamId, token }: { streamId: string; token: string }) => handleChunk(streamId, token),
    )
    const cleanupChatDone = window.api.onChatStreamDone(
      ({ streamId }: { streamId: string }) => handleDone(streamId),
    )
    const cleanupChatError = window.api.onChatStreamError(
      ({ streamId, error: errMsg }: { streamId: string; error: string }) => handleError(streamId, errMsg),
    )

    // ── Research stream events ─────────────────────────────────

    const cleanupResearchChunk = window.api.onResearchStreamChunk(
      ({ streamId, token }: { streamId: string; token: string }) => handleChunk(streamId, token),
    )
    const cleanupResearchDone = window.api.onResearchStreamDone(
      ({ streamId }: { streamId: string }) => handleDone(streamId),
    )
    const cleanupResearchError = window.api.onResearchStreamError(
      ({ streamId, error: errMsg }: { streamId: string; error: string }) => handleError(streamId, errMsg),
    )

    // ── Tool call events ───────────────────────────────────────

    const cleanupToolStart = window.api.onChatStreamToolStart(
      ({ streamId, toolName, args }: { streamId: string; toolName: string; args: Record<string, unknown> }) =>
        handleToolStart(streamId, toolName, args),
    )
    const cleanupToolResult = window.api.onChatStreamToolResult(
      ({ streamId, toolName, result }: { streamId: string; toolName: string; result: string }) =>
        handleToolResult(streamId, toolName, result),
    )

    return () => {
      cleanupChatChunk()
      cleanupChatDone()
      cleanupChatError()
      cleanupResearchChunk()
      cleanupResearchDone()
      cleanupResearchError()
      cleanupToolStart()
      cleanupToolResult()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [addMessage, saveToolCalls])

  const sendMessage = useCallback(
    async (content: string, images?: string[]) => {
      const store = useChatHistoryStore.getState()
      const convId = store.activeConversationId
      if (!convId) return

      setError(null)
      conversationIdRef.current = convId

      const userMessage = {
        id: crypto.randomUUID(),
        role: 'user' as const,
        content,
        timestamp: new Date().toISOString(),
        ...(images && images.length > 0 ? { images } : {}),
      }
      await addMessage(convId, userMessage)

      const streamId = crypto.randomUUID()
      streamIdRef.current = streamId
      contentRef.current = ''
      setIsStreaming(true)
      setStreamingContent('')
      setToolCalls([])
      toolCallsRef.current = []
      setPreToolContent('')
      preToolContentRef.current = ''

      // Consume the one-shot auto-approve flag exactly once per send.
      const autoApprove = autoApproveNextRunRef.current
      autoApproveNextRunRef.current = false

      // ── URL-only crawl flow ──────────────────────────────────
      if (isUrlOnly(content)) {
        setCrawlNavLinks(null)
        // Show crawling indicator via synthetic tool call
        const crawlToolId = crypto.randomUUID()
        const crawlTool: ToolCall = {
          id: crawlToolId,
          toolName: 'crawl_webpage',
          args: { url: content.trim() },
          status: 'running',
          startedAt: new Date().toISOString(),
        }
        setToolCalls([crawlTool])
        toolCallsRef.current = [crawlTool]

        try {
          const result = await window.api.crawlWebpage(content.trim())

          // Mark crawl as done
          const completedAt = new Date().toISOString()
          const completedTool = {
            ...crawlTool,
            status: 'done' as const,
            result: result.success ? `Crawled: ${result.title || result.url}` : `Failed: ${result.error}`,
            completedAt,
          }
          setToolCalls([completedTool])
          toolCallsRef.current = [completedTool]

          if (!result.success) {
            setIsStreaming(false)
            setError(`Failed to crawl webpage: ${result.error}`)
            streamIdRef.current = null
            return
          }

          // Pick navigation links for the footer
          const allLinks = [...(result.internalLinks || []), ...(result.externalLinks || [])]
          const meaningfulLinks = allLinks.filter(
            (l) => l.text && l.text.length > 2 && !l.href.includes('#') && l.href !== result.url,
          )
          const prev = meaningfulLinks.length > 0 ? meaningfulLinks[0] : null
          const next = meaningfulLinks.length > 1 ? meaningfulLinks[meaningfulLinks.length - 1] : null
          setCrawlNavLinks(prev || next ? { prev, next } : null)

          // Build AI analysis prompt from crawled content
          const analysisPrompt = buildWebAnalysisPrompt({
            url: result.url!,
            title: result.title!,
            description: result.description!,
            content: result.content!,
            internalLinks: result.internalLinks!,
            externalLinks: result.externalLinks!,
          })

          // Send to AI via regular chat backend with the crawled content as context
          usedResearchRef.current = false
          window.api.sendChatMessage({
            streamId,
            conversationId: convId,
            model: useSettingsStore.getState().chatModel,
            systemPrompt: buildSystemPrompt(
              analysisPrompt,
              useChatHistoryStore.getState().getActiveAgentMode(),
              autoApprove,
            ),
          });
        } catch (err) {
          setIsStreaming(false)
          setError(`Failed to crawl webpage: ${err}`)
          setToolCalls([])
          toolCallsRef.current = []
          streamIdRef.current = null
        }
        return
      }

      // ── Standard message flow ────────────────────────────────
      const sources = store.activeSources
      const repoSource = sources.find((s) => s.sourceType === 'repo')
      const nonRepoSources = sources.filter((s) => s.sourceType !== 'repo')
      const hasNonRepoSources = nonRepoSources.length > 0

      if (hasNonRepoSources) {
        // Route to research backend with source context (files, raw text)
        usedResearchRef.current = true
        const sourceFiles = sources.map((s) => ({
          sourceType: s.sourceType,
          path: s.path,
          name: s.name,
        }))
        window.api.sendResearchQuery({
          streamId,
          sessionId: convId,
          query: content,
          sources: sourceFiles,
          model: useSettingsStore.getState().chatModel,
        })
      } else {
        // Route to regular chat backend — with agentic tools if repo attached
        usedResearchRef.current = false

        // Detect slash commands and split into local (auto-execute) vs non-local (ask confirmation)
        const detectedCommands = extractCommands(content, useCommandStore.getState().commands)
        const localCommands = detectedCommands.filter((c) => isLocallyExecutable(c.toolName))
        const nonLocalCommands = detectedCommands.filter((c) => !isLocallyExecutable(c.toolName))

        let systemPrompt = buildSystemPrompt(
          useSettingsStore.getState().chatSystemPrompt,
          useChatHistoryStore.getState().getActiveAgentMode(),
          autoApprove,
        )

        // Local commands: tell the AI to use the tools directly (they're registered in the agentic loop)
        if (localCommands.length > 0) {
          const cmdList = localCommands
            .map((c) => `- /${c.name}: Tool "${c.toolName}" — ${c.description}`)
            .join('\n')
          systemPrompt += `\n\n────────────────────────────────────────────────────────────
SLASH COMMANDS — AUTO-EXECUTE
────────────────────────────────────────────────────────────

The user's message contains the following slash commands that have local executors available as tools:
${cmdList}

You MUST execute the associated tool immediately using the tool/function calling mechanism — do NOT ask for confirmation. Extract the required arguments from the user's message and call the tool directly. After receiving the result, analyze and present it to the user.`
        }

        // Non-local commands: tell the AI to ask for confirmation (current behavior)
        if (nonLocalCommands.length > 0) {
          const cmdList = nonLocalCommands
            .map((c) => `- /${c.name}: Tool "${c.toolName}" — ${c.description}`)
            .join('\n')
          systemPrompt += `\n\n────────────────────────────────────────────────────────────
SLASH COMMANDS — CONFIRMATION REQUIRED
────────────────────────────────────────────────────────────

The user's message contains the following slash commands:
${cmdList}

When you encounter these commands, you MUST ask the user for explicit confirmation before executing the associated tool. Present the tool name, what it will do with the provided arguments, and wait for user approval before proceeding. Do NOT auto-execute — the user wants to review and approve each tool invocation.`
        }

        // Collect tool names from local commands to register in the agentic loop (deduplicated)
        const commandToolNames = [...new Set(localCommands.map((c) => c.toolName))]

        window.api.sendChatMessage({
          streamId,
          conversationId: convId,
          model: useSettingsStore.getState().chatModel,
          systemPrompt,
          repoPath: repoSource?.path || undefined,
          commandTools: commandToolNames.length > 0 ? commandToolNames : undefined,
        });
      }
    },
    [addMessage],
  )

  const stopStream = useCallback(() => {
    if (streamIdRef.current) {
      if (usedResearchRef.current) {
        window.api.abortResearchStream(streamIdRef.current)
      } else {
        window.api.abortChatStream(streamIdRef.current)
      }
    }
    // Reset local state immediately so the UI reflects the stop
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    pendingTokenRef.current = false

    const convId = conversationIdRef.current
    if (contentRef.current && convId) {
      addMessage(convId, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: contentRef.current,
        timestamp: new Date().toISOString(),
      })
    }

    setIsStreaming(false)
    contentRef.current = ''
    setStreamingContent('')
    setToolCalls([])
    toolCallsRef.current = []
    setPreToolContent('')
    preToolContentRef.current = ''
    streamIdRef.current = null
  }, [addMessage])

  const primeAutoApproveNextRun = useCallback(() => {
    autoApproveNextRunRef.current = true
  }, [])

  return {
    isStreaming,
    streamingContent,
    error,
    toolCalls,
    preToolContent,
    crawlNavLinks,
    sendMessage,
    stopStream,
    primeAutoApproveNextRun,
  }
}
