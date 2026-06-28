import type {
  PmCategory,
  PmFolder,
  PmPrompt,
} from '@/store/prompt-manager-store'

import type { PromptsAppData } from '../../PromptsApp.types'

export interface PromptsAppBreadcrumbProps {
  data: PromptsAppData
}

export interface PromptsAppBreadcrumbData {
  /** Resolved active prompt, or `null` when the Browse tab is active. */
  activePrompt: PmPrompt | null
  folder: PmFolder | undefined
  category: PmCategory | undefined
  handleSelectFolder: () => void
  handleSelectCategory: () => void
}
