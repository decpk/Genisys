import { MAX_AGENTIC_ITERATIONS } from '@/prompts'

import type {
  AgenticLoopCallbacks,
  AgenticLoopParams,
  ChatMessage,
  CompletionResult,
} from './agenticLoop.types'
import { executeToolCall } from './execution/executeToolCall'
import { forceFinalAnswer } from './fallback/forceFinalAnswer'
import { buildAssistantToolCallMessage } from './messages/buildAssistantToolCallMessage'
import { composePredicates } from './predicates/composePredicates'
import { isCancelled } from './predicates/isCancelled'
import { isConsecutiveToolErrors } from './predicates/isConsecutiveToolErrors'
import { isFinishReasonStopWithContent } from './predicates/isFinishReasonStopWithContent'
import { isMaxIterationsReached } from './predicates/isMaxIterationsReached'
import { isNoNewToolCalls } from './predicates/isNoNewToolCalls'
import { isRepeatedToolCall } from './predicates/isRepeatedToolCall'
import { createLoopState } from './state/createLoopState'
import { incrementIteration } from './state/incrementIteration'
import { resetBudget } from './state/resetBudget'

const DEFAULT_REPEATED_TOOL_CALL_LIMIT = 2
const DEFAULT_CONSECUTIVE_ERROR_LIMIT = 3

/**
 * Generic agentic loop. Takes a `transport`, a system prompt, a tool
 * registry, and lifecycle callbacks; drives the streaming chat-completion
 * → tool-execution → re-prompt cycle until the model produces a final
 * answer (or one of the stop predicates fires).
 *
 * The loop is deliberately framework-agnostic — panel runners are expected
 * to be thin wrappers that supply panel-specific tool registries / system
 * prompts and forward callbacks to their own UI store.
 */
export async function agenticLoop(params: AgenticLoopParams): Promise<void> {
  const {
    transport,
    systemPrompt,
    conversationHistory,
    userMessage,
    tools,
    toolRegistry,
    callbacks,
    options = {},
  } = params

  const maxIterations = options.maxIterations ?? MAX_AGENTIC_ITERATIONS
  const repeatedToolCallLimit =
    options.repeatedToolCallLimit ?? DEFAULT_REPEATED_TOOL_CALL_LIMIT
  const consecutiveErrorLimit =
    options.consecutiveErrorLimit ?? DEFAULT_CONSECUTIVE_ERROR_LIMIT

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ]

  const state = createLoopState()

  const earlyStop = composePredicates([
    isCancelled(options.isCancelled),
    isNoNewToolCalls(),
    isFinishReasonStopWithContent(),
    isConsecutiveToolErrors(consecutiveErrorLimit),
  ])

  const budgetStop = composePredicates([isMaxIterationsReached(maxIterations)])

  // Main loop. We bail out from inside via `return` so the eslint rule
  // about constant-condition loops can stay happy.
  while (true) {
    incrementIteration(state)

    // Budget check — fires before we make the wire call.
    const budgetVerdict = budgetStop({ state, callbacks })
    if (budgetVerdict.shouldStop) {
      const continueGranted = await maybeContinue({
        callbacks,
        iterationsUsed: state.iteration,
        totalToolCalls: state.totalToolCalls,
      })
      if (continueGranted === true) {
        resetBudget(state)
      } else {
        await runForcedFinalAnswer({
          transport,
          messages,
          callbacks,
        })
        return
      }
    }

    // Wire call.
    let result: CompletionResult
    try {
      result = await transport.send({ messages, tools, callbacks })
    } catch (err) {
      callbacks.onError(err instanceof Error ? err.message : 'Unknown error')
      return
    }

    // Early stops driven by the latest result.
    const earlyVerdict = earlyStop({ state, lastResult: result, callbacks })
    if (earlyVerdict.shouldStop) {
      if (earlyVerdict.errorMessage !== undefined) {
        callbacks.onError(earlyVerdict.errorMessage)
        return
      }
      callbacks.onDone(earlyVerdict.finalContent ?? result.content)
      return
    }

    // Push the assistant turn (with tool_calls) to history before tools run.
    messages.push(buildAssistantToolCallMessage(result.content, result.toolCalls))

    // Execute each tool call sequentially.
    let lastToolHash: string | undefined
    for (const tc of result.toolCalls) {
      const outcome = await executeToolCall({
        toolCall: tc,
        toolRegistry,
        state,
        callbacks,
        repeatedToolCallLimit,
        isToolAllowed: options.isToolAllowed,
        buildBlockedToolMessage: options.buildBlockedToolMessage,
      })
      messages.push(outcome.message)
      if (outcome.hash !== undefined) lastToolHash = outcome.hash
    }

    // Repeated-tool-call sanity check after this iteration's calls.
    const repeatedCheck = isRepeatedToolCall(repeatedToolCallLimit)({
      state,
      lastToolHash,
    })
    if (repeatedCheck.shouldStop) {
      // Don't error out — the model already saw the dedup notice we pushed
      // as a tool message. Let the next iteration give it a chance to
      // produce a final answer.
    }
  }
}

interface MaybeContinueParams {
  callbacks: AgenticLoopCallbacks
  iterationsUsed: number
  totalToolCalls: number
}

async function maybeContinue(params: MaybeContinueParams): Promise<boolean> {
  const { callbacks, iterationsUsed, totalToolCalls } = params
  if (callbacks.onContinueRequired === undefined) return false
  return callbacks.onContinueRequired({ iterationsUsed, totalToolCalls })
}

interface RunForcedFinalAnswerParams {
  transport: AgenticLoopParams['transport']
  messages: ChatMessage[]
  callbacks: AgenticLoopCallbacks
}

async function runForcedFinalAnswer(params: RunForcedFinalAnswerParams): Promise<void> {
  const { transport, messages, callbacks } = params
  try {
    const finalResult = await forceFinalAnswer({ transport, messages, callbacks })
    callbacks.onDone(finalResult.content)
  } catch (err) {
    callbacks.onError(err instanceof Error ? err.message : 'Unknown error')
  }
}
