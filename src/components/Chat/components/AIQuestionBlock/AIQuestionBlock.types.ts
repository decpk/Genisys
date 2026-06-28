export type AIQuestionType = 'confirm' | 'single_choice' | 'multi_choice' | 'text' | 'function_confirm'

export interface AIFunctionCall {
  name: string
  args: Record<string, unknown>
}

export interface AIQuestion {
  id: string
  question: string
  type: AIQuestionType
  description?: string
  options?: string[]
  functionCall?: AIFunctionCall
}

export interface AIQuestionAnswer {
  questionId: string
  answer: string | string[] | boolean
}

export interface AIQuestionBlockProps {
  questions: AIQuestion[]
  messageId: string
  isAnswered: boolean
  onSubmitAnswers: (answers: AIQuestionAnswer[], questions: AIQuestion[]) => void
  onExecuteFunction?: (functionName: string, args: Record<string, unknown>) => Promise<string>
}

export interface ContentSegment {
  type: 'markdown' | 'questions'
  content: string
  questions?: AIQuestion[]
}
