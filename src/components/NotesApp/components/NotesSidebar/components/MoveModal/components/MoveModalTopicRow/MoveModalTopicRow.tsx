import { FolderOpen } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { MoveModalTopicRowProps } from './MoveModalTopicRow.types'
import {
  moveModalTopicRowBaseClass,
  moveModalTopicRowSpacerClass,
  moveModalTopicRowStateClass,
} from './MoveModalTopicRow.styles'

export function MoveModalTopicRow(props: MoveModalTopicRowProps) {
  const { topic, isSelected, onSelect } = props
  const stateClass = isSelected
    ? moveModalTopicRowStateClass.selected
    : moveModalTopicRowStateClass.idle
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(moveModalTopicRowBaseClass, stateClass)}
    >
      <div className={moveModalTopicRowSpacerClass} />
      <FolderOpen size={14} className="shrink-0" />
      {topic.name}
    </button>
  )
}
