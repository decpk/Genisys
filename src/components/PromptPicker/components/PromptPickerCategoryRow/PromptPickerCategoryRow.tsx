import type { PmCategory, PmPrompt } from '@/store/prompt-manager-store'

import { promptPickerStyles } from '../../PromptPicker.styles'
import { PromptPickerPromptRow } from '../PromptPickerPromptRow'

export interface PromptPickerCategoryRowProps {
  category: PmCategory
  prompts: PmPrompt[]
  onSelectPrompt: (prompt: PmPrompt) => void
}

export function PromptPickerCategoryRow(props: PromptPickerCategoryRowProps): React.JSX.Element {
  const { category, prompts, onSelectPrompt } = props
  return (
    <div>
      <div className={promptPickerStyles.categoryHeader}>
        <span className="truncate">{category.name}</span>
      </div>
      {prompts.map((prompt) => (
        <PromptPickerPromptRow key={prompt.id} prompt={prompt} onSelect={onSelectPrompt} />
      ))}
    </div>
  )
}
