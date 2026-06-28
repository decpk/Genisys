import type { PmPrompt } from '@/store/prompt-manager-store'

export interface PromptsAppPromptViewerActionsProps {
  prompt: PmPrompt
  onCopy: (prompt: PmPrompt) => void
  onShare: (prompt: PmPrompt) => void
  onEdit: (prompt: PmPrompt) => void
  onMove: (prompt: PmPrompt) => void
  onRequestDelete: () => void
}
