import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import type { PmPrompt } from '@/store/prompt-manager-store'

import { PromptPickerPromptPreview } from '../PromptPickerPromptPreview'
import { promptPickerPromptPreviewStyles } from '../PromptPickerPromptPreview/PromptPickerPromptPreview.styles'
import { promptPickerStyles } from '../../PromptPicker.styles'

export interface PromptPickerPromptRowProps {
  prompt: PmPrompt
  onSelect: (prompt: PmPrompt) => void
}

export function PromptPickerPromptRow(props: PromptPickerPromptRowProps): React.JSX.Element {
  const { prompt, onSelect } = props
  const hasDesc = prompt.description.length > 0

  let descNode: React.ReactNode = null
  if (hasDesc) {
    descNode = <span className={promptPickerStyles.promptDesc}>{prompt.description}</span>
  }

  return (
    <HoverCard openDelay={250} closeDelay={150}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className={promptPickerStyles.promptRow}
          onClick={() => onSelect(prompt)}
        >
          <span className={promptPickerStyles.promptTitle}>{prompt.title}</span>
          {descNode}
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="start"
        sideOffset={8}
        collisionPadding={8}
        className={promptPickerPromptPreviewStyles.container}
        onClick={(e) => e.stopPropagation()}
      >
        <PromptPickerPromptPreview prompt={prompt} />
      </HoverCardContent>
    </HoverCard>
  )
}
