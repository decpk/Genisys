import type { PromptSortOption } from '../../sort'

export interface PromptsAppSortMenuProps {
  value: PromptSortOption
  onChange: (option: PromptSortOption) => void
}
