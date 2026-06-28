export { AIQuestionBlock } from './AIQuestionBlock'
export { AssistantQuestionsContent } from './AssistantQuestionsContent'
export type { AssistantQuestionsContentProps } from './AssistantQuestionsContent'
export { parseAIQuestions, parsePartialAIQuestions, hasAIQuestions, formatQAResponse } from './parseQuestions'
export type { PartialAIQuestionsResult } from './parseQuestions'
export { AI_QUESTIONS_INSTRUCTION } from '@/prompts/chatAiQuestionsInstruction'
export type {
  AIQuestion,
  AIQuestionAnswer,
  AIQuestionBlockProps,
  AIQuestionType,
  AIFunctionCall,
  ContentSegment,
} from './AIQuestionBlock.types'

// Action block re-exports — surfaces consume both Q&A + actions from one
// barrel so the wiring story is consistent.
export {
  AIActionBlock,
  hasAIActions,
  parseAIActions,
  parsePartialAIActions,
  DEFAULT_IMPLEMENT_PROMPT,
  DEFAULT_REFINE_PROMPT,
} from '../AIActionBlock'
export type {
  AIActionBlockProps,
  AIActionDirective,
  AIActionHandler,
  AIActionId,
  AIActionOpts,
  ParsedAIActions,
  PartialAIActionsResult,
} from '../AIActionBlock'
