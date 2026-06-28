import type { PmPrompt } from '@/store/prompt-manager-store'

export type PromptSortOption =
  | 'manual'
  | 'name-asc'
  | 'name-desc'
  | 'created-desc'
  | 'created-asc'
  | 'updated-desc'

export interface PromptSortDescriptor {
  value: PromptSortOption
  label: string
}

export type PromptComparator = (a: PmPrompt, b: PmPrompt) => number
