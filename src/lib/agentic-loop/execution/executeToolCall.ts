import { describeToolActivity } from '@/ai/tools/describeToolActivity'
import type { ToolResult } from '@/ai/tools/tools.types'

import type {
  AgenticLoopCallbacks,
  ChatMessage,
  LoopState,
  RawToolCall,
  ToolRegistry,
} from '../agenticLoop.types'
import { buildDedupNoticeMessage } from '../messages/buildDedupNoticeMessage'
import { buildInvalidArgsMessage } from '../messages/buildInvalidArgsMessage'
import { buildToolBlockedByModeMessage } from '../messages/buildToolBlockedByModeMessage'
import { buildToolResultMessage } from '../messages/buildToolResultMessage'
import { buildUnknownToolMessage } from '../messages/buildUnknownToolMessage'
import { hashToolCall } from '../state/hashToolCall'
import { recordToolCall } from '../state/recordToolCall'
import { recordToolError } from '../state/recordToolError'
import { resetConsecutiveErrors } from '../state/resetConsecutiveErrors'

import { handleConfirmRequired } from './handleConfirmRequired'
import { parseToolArguments } from './parseToolArguments'

export interface ExecuteToolCallParams {
  toolCall: RawToolCall
  toolRegistry: ToolRegistry
  state: LoopState
  callbacks: AgenticLoopCallbacks
  /** Repeated `name + args` calls beyond this count are suppressed. */
  repeatedToolCallLimit: number
  /**
   * Optional per-tool permission gate. When provided and it returns
   * `false` for the requested tool name, the call is short-circuited
   * with a "blocked by mode" tool message before any execution happens.
   * This is the defence-in-depth check for read-only modes (Plan / Ask).
   */
  isToolAllowed?: (toolName: string) => boolean
  /** Builds the message used when `isToolAllowed` rejects a call. */
  buildBlockedToolMessage?: (toolName: string) => string
}

export interface ExecuteToolCallOutcome {
  /** Message to push to the conversation history (always a tool message). */
  message: ChatMessage
  /** Hash of the call we recorded — `undefined` when the call was unknown / malformed. */
  hash?: string
  /** Whether the outcome counts as an error for `consecutiveErrors` tracking. */
  wasError: boolean
}

/**
 * Execute a single tool call returned by the model:
 *
 * 1. Look up the tool in the registry. Unknown → push `unknown tool` message.
 * 2. Parse arguments. Malformed → push `invalid args` message.
 * 3. Hash + record the call. If the count exceeds `repeatedToolCallLimit`,
 *    skip execution and push the dedup notice instead.
 * 4. Otherwise, fire `onToolStart`, run the tool, and route the result:
 *    - success → push the result and `onToolResult`.
 *    - error → push the error and `onToolResult`; bump `consecutiveErrors`.
 *    - confirm-required → forward to `handleConfirmRequired`, then push.
 */
export async function executeToolCall(
  params: ExecuteToolCallParams,
): Promise<ExecuteToolCallOutcome> {
  const {
    toolCall,
    toolRegistry,
    state,
    callbacks,
    repeatedToolCallLimit,
    isToolAllowed,
    buildBlockedToolMessage,
  } = params
  const { id, name, arguments: rawArgs } = toolCall

  // Defence-in-depth mode gate: refuse blocked tools BEFORE looking up
  // the registry, so a hallucinated write-tool name in a read-only mode
  // is rejected the same way as one that exists.
  if (isToolAllowed !== undefined && !isToolAllowed(name)) {
    const blockedMessage = buildBlockedToolMessage?.(name) ?? `Tool "${name}" is not allowed in the current mode.`
    callbacks.onToolResult(name, blockedMessage)
    recordToolError(state)
    return {
      message: buildToolBlockedByModeMessage(id, blockedMessage),
      wasError: true,
    }
  }

  const toolModule = toolRegistry[name]
  if (!toolModule) {
    return {
      message: buildUnknownToolMessage(id, name),
      wasError: true,
    }
  }

  const parsed = parseToolArguments(rawArgs)
  if (!parsed.ok) {
    callbacks.onToolResult(name, `Invalid arguments: ${parsed.reason}`)
    return {
      message: buildInvalidArgsMessage(id, rawArgs, parsed.reason),
      wasError: true,
    }
  }

  const args = parsed.value
  const hash = hashToolCall(name, rawArgs)
  const newCount = recordToolCall(state, hash)

  if (newCount > repeatedToolCallLimit) {
    return {
      message: buildDedupNoticeMessage(id, name),
      hash,
      wasError: false,
    }
  }

  callbacks.onToolStart({
    toolName: name,
    label: describeToolActivity(name, args),
    args,
    status: 'running',
  })

  let toolResult: ToolResult
  try {
    toolResult = await toolModule.execute(args, { confirmed: false })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Tool execution failed'
    callbacks.onToolResult(name, errorMsg)
    recordToolError(state)
    return {
      message: buildToolResultMessage(id, errorMsg),
      hash,
      wasError: true,
    }
  }

  if (toolResult.kind === 'confirm-required') {
    const outcome = await handleConfirmRequired({
      confirmAction: toolResult.confirmAction,
      executeAfterConfirm: toolResult.executeAfterConfirm,
      callbacks,
    })
    callbacks.onToolResult(name, outcome.message)
    if (outcome.status === 'error') {
      recordToolError(state)
      return {
        message: buildToolResultMessage(id, outcome.message),
        hash,
        wasError: true,
      }
    }
    resetConsecutiveErrors(state)
    return {
      message: buildToolResultMessage(id, outcome.message),
      hash,
      wasError: false,
    }
  }

  if (toolResult.kind === 'error') {
    callbacks.onToolResult(name, toolResult.message)
    recordToolError(state)
    return {
      message: buildToolResultMessage(id, toolResult.message),
      hash,
      wasError: true,
    }
  }

  callbacks.onToolResult(name, toolResult.message)
  resetConsecutiveErrors(state)
  return {
    message: buildToolResultMessage(id, toolResult.message),
    hash,
    wasError: false,
  }
}
