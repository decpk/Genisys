import { BookMarked, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { MoveModalTopicRow } from '../MoveModalTopicRow'
import type { MoveModalSectionRowProps } from './MoveModalSectionRow.types'
import {
  moveModalSectionRowChevronButtonClass,
  moveModalSectionRowChevronIconBaseClass,
  moveModalSectionRowChevronIconExpandedClass,
  moveModalSectionRowContainerClass,
  moveModalSectionRowLabelBaseClass,
  moveModalSectionRowLabelStateClass,
  moveModalSectionRowSpacerClass,
} from './MoveModalSectionRow.styles'

export function MoveModalSectionRow(props: MoveModalSectionRowProps) {
  const {
    section,
    topics,
    isExpanded,
    isSelected,
    selectedTopicId,
    showTopics,
    onToggle,
    onSelect,
    onSelectTopic,
  } = props

  const hasTopics = topics.length > 0
  const canExpand = showTopics && hasTopics

  const labelStateClass = isSelected
    ? moveModalSectionRowLabelStateClass.selected
    : moveModalSectionRowLabelStateClass.idle

  let chevronOrSpacer: React.ReactNode
  if (canExpand) {
    const iconExpandedClass = isExpanded ? moveModalSectionRowChevronIconExpandedClass : ''
    chevronOrSpacer = (
      <button
        type="button"
        onClick={onToggle}
        className={moveModalSectionRowChevronButtonClass}
      >
        <ChevronRight
          size={14}
          className={cn(moveModalSectionRowChevronIconBaseClass, iconExpandedClass)}
        />
      </button>
    )
  } else {
    chevronOrSpacer = <div className={moveModalSectionRowSpacerClass} />
  }

  const renderedTopics = canExpand && isExpanded
    ? topics.map((topic) => (
        <MoveModalTopicRow
          key={topic.id}
          topic={topic}
          isSelected={selectedTopicId === topic.id}
          onSelect={() => onSelectTopic(topic.id)}
        />
      ))
    : null

  return (
    <div className={moveModalSectionRowContainerClass}>
      <div className="flex items-center">
        {chevronOrSpacer}
        <button
          type="button"
          onClick={onSelect}
          className={cn(moveModalSectionRowLabelBaseClass, labelStateClass)}
        >
          <BookMarked size={14} className="shrink-0" />
          {section.name}
        </button>
      </div>
      {renderedTopics}
    </div>
  )
}
