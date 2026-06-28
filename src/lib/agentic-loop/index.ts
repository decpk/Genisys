export { agenticLoop } from './agenticLoop'
export { createDailyPlanTransport } from './transport/createDailyPlanTransport'
export {
  createCodeTransport,
  type CreateCodeTransportOptions,
} from './transport/createCodeTransport'
export { USE_NEW_AGENTIC_LOOP } from './featureFlag'

export type {
  AgenticLoopParams,
  AgenticLoopCallbacks,
  AgenticLoopOptions,
  ChatMessage,
  CompletionResult,
  ToolRegistry,
  CompletionTransport,
} from './agenticLoop.types'
