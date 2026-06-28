import type { PmPrompt } from '@/store/prompt-manager-store'

import type { PromptsAppData } from '../../PromptsApp.types'

export interface PromptsAppPromptViewerProps {
  prompt: PmPrompt
  data: PromptsAppData
}

export interface PromptsAppPromptViewerHandlers {
  handleCopy: (prompt: PmPrompt) => void
  handleShare: (prompt: PmPrompt) => void
  handleEdit: (prompt: PmPrompt) => void
  handleMove: (prompt: PmPrompt) => void
  handleRequestDelete: () => void
}
