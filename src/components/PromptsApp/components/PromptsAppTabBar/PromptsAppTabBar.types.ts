import type { PmPrompt } from '@/store/prompt-manager-store'

import type { PromptsAppData } from '../../PromptsApp.types'

export interface PromptsAppTabBarProps {
  data: PromptsAppData
}

export interface PromptsAppTabBarData {
  /** Resolved `PmPrompt` for each open tab, in tab order. */
  tabPrompts: PmPrompt[]
  /** Currently active tab id; `null` means the Browse tab is active. */
  activePromptTabId: string | null
  /** Lookup: prompt id → folder color for the leading dot. */
  folderColorByPromptId: Record<string, string | undefined>
  handleSelectBrowse: () => void
  handleActivate: (id: string) => void
  handleClose: (id: string) => void
  handleCloseOthers: (id: string) => void
  handleCloseAll: () => void
  handleCopy: (prompt: PmPrompt) => void
}
