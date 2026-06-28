import type { PmPrompt } from '@/store/prompt-manager-store'

export interface PromptsAppTabProps {
  prompt: PmPrompt
  isActive: boolean
  folderColor: string | undefined
  onActivate: (id: string) => void
  onClose: (id: string) => void
  onCloseOthers: (id: string) => void
  onCloseAll: () => void
  onCopy: (prompt: PmPrompt) => void
}
