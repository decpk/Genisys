import {
  DAILYPLAN_READ_TOOL_NAMES,
  DAILYPLAN_TOOL_DEFINITIONS,
  DAILYPLAN_TOOL_REGISTRY,
} from '@/ai/tools/daily-plan'
import type { ToolResult } from '@/ai/tools/daily-plan/tools.types'
import type { AIToolActivity, AIConfirmAction } from '@/right-panels/AIAssistantPanel'
import { describeToolActivity } from '@/ai/tools/describeToolActivity'
import { resolveToolConfirmation } from '@/lib/ai-assistant-auto-approve'
import type { AgentMode } from '@/components/Chat/components/AgentModeSelector'
import {
  buildBlockedToolMessage,
  createIsToolAllowedForMode,
  filterToolDefinitionsByMode,
} from '@/lib/ai-tool-mode-gate'
import {
  agenticLoop,
  createDailyPlanTransport,
  USE_NEW_AGENTIC_LOOP,
} from '@/lib/agentic-loop'

const MAX_ITERATIONS = 25

export interface RunnerCallbacks {
  onChunk: (token: string) => void
  onReasoningChunk?: (token: string) => void
  onToolStart: (activity: AIToolActivity) => void
  onToolResult: (toolName: string, result: string) => void
  onConfirmRequired: (confirmAction: AIConfirmAction) => Promise<boolean>
  /**
   * Optional predicate that lets the host short-circuit confirmation
   * prompts (e.g. when the panel is running in `'agent'` mode). When it
   * returns `true`, the runner skips `onConfirmRequired` and executes
   * the tool's `executeAfterConfirm` directly.
   */
  isAutoApprove?: () => boolean
  /**
   * Optional hook invoked when the agentic loop has used its iteration
   * budget. Resolve `true` to grant another budget worth of iterations,
   * `false` to stop and force a final answer.
   */
  onContinueRequired?: (info: {
    iterationsUsed: number
    totalToolCalls: number
  }) => Promise<boolean>
  onDone: (content: string) => void
  onError: (error: string) => void
}

interface CompletionResult {
  content: string
  toolCalls: Array<{ id: string; name: string; arguments: string }>
  finishReason: string
}

function callCompletion(
  messages: any[],
  tools: any[],
  callbacks: RunnerCallbacks,
  model?: string,
): Promise<CompletionResult> {
  return new Promise((resolve, reject) => {
    const streamId = crypto.randomUUID()

    const unlistenChunk = window.api.onDailyPlanAIChunk((data: any) => {
      if (data.streamId !== streamId) return
      callbacks.onChunk(data.token)
    })

    const unlistenReasoning = window.api.onDailyPlanAIReasoningChunk((data: { streamId: string; token: string }) => {
      if (data.streamId !== streamId) return
      callbacks.onReasoningChunk?.(data.token)
    })

    const unlistenDone = window.api.onDailyPlanAIDone((data: any) => {
      if (data.streamId !== streamId) return
      cleanup()
      resolve({
        content: data.content || '',
        toolCalls: data.toolCalls || [],
        finishReason: data.finishReason || 'stop',
      })
    })

    const unlistenError = window.api.onDailyPlanAIError((data: any) => {
      if (data.streamId !== streamId) return
      cleanup()
      reject(new Error(data.error || 'Unknown error'))
    })

    function cleanup() {
      unlistenChunk()
      unlistenReasoning()
      unlistenDone()
      unlistenError()
    }

    window.api.sendDailyPlanAICompletion({
      streamId,
      messages,
      tools,
      ...(model ? { model } : {}),
    }).catch((err: Error) => {
      cleanup()
      reject(err)
    })
  })
}

export async function runDailyPlanAI(
  systemPrompt: string,
  conversationHistory: Array<{ role: string; content: string }>,
  userMessage: string,
  callbacks: RunnerCallbacks,
  options: { mode?: AgentMode; model?: string } = {},
): Promise<void> {
  const mode: AgentMode = options.mode ?? 'agent'
  const filteredTools = filterToolDefinitionsByMode(
    mode,
    DAILYPLAN_TOOL_DEFINITIONS,
    DAILYPLAN_READ_TOOL_NAMES,
  )
  const isToolAllowed = createIsToolAllowedForMode(mode, DAILYPLAN_READ_TOOL_NAMES)

  if (USE_NEW_AGENTIC_LOOP) {
    return agenticLoop({
      systemPrompt,
      conversationHistory: conversationHistory as never,
      userMessage,
      tools: filteredTools,
      toolRegistry: DAILYPLAN_TOOL_REGISTRY,
      transport: createDailyPlanTransport({
        modelGetter: () => options.model,
      }),
      callbacks,
      options: {
        isToolAllowed,
        buildBlockedToolMessage: (name) => buildBlockedToolMessage(mode, name),
      },
    })
  }

  // === legacy path below ===
  const messages: any[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ]

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    let result: CompletionResult
    try {
      result = await callCompletion(messages, filteredTools, callbacks, options.model)
    } catch (err) {
      callbacks.onError(err instanceof Error ? err.message : 'Unknown error')
      return
    }

    // No tool calls — we're done
    if (result.toolCalls.length === 0) {
      callbacks.onDone(result.content)
      return
    }

    // Build assistant message with tool_calls (required by API for multi-turn)
    const tcValues = result.toolCalls.map((tc) => ({
      id: tc.id,
      type: 'function',
      function: { name: tc.name, arguments: tc.arguments },
    }))

    messages.push({
      role: 'assistant',
      content: result.content || null,
      tool_calls: tcValues,
    })

    // Execute each tool call
    for (const tc of result.toolCalls) {
      // Defence-in-depth mode gate (legacy path).
      if (!isToolAllowed(tc.name)) {
        const blocked = buildBlockedToolMessage(mode, tc.name)
        callbacks.onToolResult(tc.name, blocked)
        messages.push({ role: 'tool', tool_call_id: tc.id, content: blocked })
        continue
      }

      const toolModule = DAILYPLAN_TOOL_REGISTRY[tc.name]
      if (!toolModule) {
        messages.push({ role: 'tool', tool_call_id: tc.id, content: `Unknown tool: ${tc.name}` })
        continue
      }

      let args: Record<string, unknown> = {}
      try {
        args = JSON.parse(tc.arguments)
      } catch {
        messages.push({ role: 'tool', tool_call_id: tc.id, content: `Invalid JSON arguments: ${tc.arguments}` })
        continue
      }

      // Emit tool start
      callbacks.onToolStart({
        toolName: tc.name,
        label: describeToolActivity(tc.name, args),
        args,
        status: 'running',
      })

      let toolResult: ToolResult
      try {
        toolResult = await toolModule.execute(args, { confirmed: false })
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Tool execution failed'
        callbacks.onToolResult(tc.name, errorMsg)
        messages.push({ role: 'tool', tool_call_id: tc.id, content: errorMsg })
        continue
      }

      // Handle confirmation flow
      if (toolResult.kind === 'confirm-required') {
        const outcome = await resolveToolConfirmation({
          confirmAction: toolResult.confirmAction,
          executeAfterConfirm: toolResult.executeAfterConfirm,
          onConfirmRequired: callbacks.onConfirmRequired,
          isAutoApprove: callbacks.isAutoApprove,
        })
        callbacks.onToolResult(tc.name, outcome.message)
        messages.push({ role: 'tool', tool_call_id: tc.id, content: outcome.message })
        continue
      }

      const resultMsg = toolResult.message
      callbacks.onToolResult(tc.name, resultMsg)
      messages.push({ role: 'tool', tool_call_id: tc.id, content: resultMsg })
    }

    // Continue loop — next iteration will send tool results back to the model
  }

  // Max iterations reached
  callbacks.onError('Reached maximum tool call limit. Please try a simpler request.')
}
