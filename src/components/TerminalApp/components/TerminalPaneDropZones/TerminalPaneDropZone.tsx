import { useDroppable } from '@dnd-kit/core'

import type { TermDropEdge, TermGroupId } from '@/store/terminal-app-store/types'

import { buildTerminalDropZoneId } from '../TerminalAppDnd/terminalAppDragIds'

import { getTerminalDropZonePositionClass } from './getTerminalDropZonePositionClass'

interface Props {
  groupId: TermGroupId
  edge: TermDropEdge
}

/**
 * One droppable region for an edge (or the centre) of a terminal pane. The
 * highlight only shows while the zone is hovered during a drag; position is
 * derived from `edge`.
 */
export function TerminalPaneDropZone({ groupId, edge }: Props) {
  const id = buildTerminalDropZoneId(groupId, edge)
  const { setNodeRef, isOver } = useDroppable({ id })

  let className = `${getTerminalDropZonePositionClass(edge)} pointer-events-auto`
  if (isOver) {
    className += ' bg-primary/15 ring-1 ring-inset ring-primary/40 rounded-sm'
  }

  return <div ref={setNodeRef} className={className} aria-hidden />
}
