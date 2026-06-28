import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

import type { PmPrompt } from '@/store/prompt-manager-store'

import { promptPickerStyles } from '../../PromptPicker.styles'
import { PromptPickerCategoryRow } from '../PromptPickerCategoryRow'
import type { PromptPickerFolderGroup } from '../../utils/groupPromptsByFolder'

export interface PromptPickerFolderRowProps {
  group: PromptPickerFolderGroup
  defaultExpanded?: boolean
  onSelectPrompt: (prompt: PmPrompt) => void
}

export function PromptPickerFolderRow(props: PromptPickerFolderRowProps): React.JSX.Element {
  const { group, defaultExpanded = false, onSelectPrompt } = props
  const [expanded, setExpanded] = useState(defaultExpanded)

  const chevronClass = `${promptPickerStyles.folderChevron} ${expanded ? 'rotate-90' : ''}`

  return (
    <div>
      <button
        type="button"
        className={promptPickerStyles.folderHeader}
        onClick={() => setExpanded((v) => !v)}
      >
        <ChevronRight size={11} className={chevronClass} />
        <span className={promptPickerStyles.folderName}>{group.folder.name}</span>
        <span className={promptPickerStyles.folderCount}>{group.count}</span>
      </button>
      {expanded &&
        group.categories.map((cat) => (
          <PromptPickerCategoryRow
            key={cat.category.id}
            category={cat.category}
            prompts={cat.prompts}
            onSelectPrompt={onSelectPrompt}
          />
        ))}
    </div>
  )
}
