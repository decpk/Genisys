import { BookOpen, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { NotebookRowProjectSuffix } from './components/NotebookRowProjectSuffix'
import type { MoveModalNotebookRowProps } from './MoveModalNotebookRow.types'
import {
  moveModalNotebookRowChevronButtonClass,
  moveModalNotebookRowChevronIconBaseClass,
  moveModalNotebookRowChevronIconExpandedClass,
  moveModalNotebookRowLabelBaseClass,
  moveModalNotebookRowLabelStateClass,
  moveModalNotebookRowRootClass,
  moveModalNotebookRowSpacerClass,
} from './MoveModalNotebookRow.styles'

export function MoveModalNotebookRow(props: MoveModalNotebookRowProps) {
  const { notebook, projectSuffix, canExpand, isExpanded, isSelected, onToggle, onSelect } = props

  const labelStateClass = isSelected
    ? moveModalNotebookRowLabelStateClass.selected
    : moveModalNotebookRowLabelStateClass.idle

  let chevronOrSpacer: React.ReactNode
  if (canExpand) {
    const iconExpandedClass = isExpanded ? moveModalNotebookRowChevronIconExpandedClass : ''
    chevronOrSpacer = (
      <button
        type="button"
        onClick={onToggle}
        className={moveModalNotebookRowChevronButtonClass}
      >
        <ChevronRight
          size={14}
          className={cn(moveModalNotebookRowChevronIconBaseClass, iconExpandedClass)}
        />
      </button>
    )
  } else {
    chevronOrSpacer = <div className={moveModalNotebookRowSpacerClass} />
  }

  return (
    <div className={moveModalNotebookRowRootClass}>
      {chevronOrSpacer}
      <button
        type="button"
        onClick={onSelect}
        className={cn(moveModalNotebookRowLabelBaseClass, labelStateClass)}
      >
        <BookOpen size={14} className="shrink-0" />
        <span className="truncate">{notebook.name}</span>
        <NotebookRowProjectSuffix suffix={projectSuffix} />
      </button>
    </div>
  )
}
