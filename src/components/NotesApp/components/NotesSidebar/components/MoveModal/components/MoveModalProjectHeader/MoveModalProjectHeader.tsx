import { Folders } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { MoveModalProjectHeaderProps } from './MoveModalProjectHeader.types'
import {
  moveModalProjectHeaderBaseClass,
  moveModalProjectHeaderTopPaddingClass,
} from './MoveModalProjectHeader.styles'

export function MoveModalProjectHeader(props: MoveModalProjectHeaderProps) {
  const { project, isFirstHeader } = props
  const topPadding = isFirstHeader
    ? moveModalProjectHeaderTopPaddingClass.first
    : moveModalProjectHeaderTopPaddingClass.subsequent
  return (
    <div className={cn(moveModalProjectHeaderBaseClass, topPadding)}>
      <Folders size={12} className="shrink-0" />
      <span className="truncate">{project.name}</span>
    </div>
  )
}
