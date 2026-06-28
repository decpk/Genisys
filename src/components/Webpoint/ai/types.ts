export type WebpointAIRole = 'user' | 'assistant'
export type WebpointAIMessageStatus = 'streaming' | 'done' | 'error'

export interface WebpointAIMessage {
  id: string
  role: WebpointAIRole
  content: string
  status?: WebpointAIMessageStatus
  appliedCount?: number
}

export type WebpointAIAction = 'replace_deck' | 'update_slide' | 'add_slides'

/** Loose, AI-provided slide shape (validated/normalized before use). */
export interface RawSlide {
  title?: string
  notes?: string
  transition?: string
  background?: unknown
  elements?: unknown[]
}

export interface ParsedWebpointResponse {
  action: WebpointAIAction
  message?: string
  title?: string
  slides?: RawSlide[]
  slide?: RawSlide
}
