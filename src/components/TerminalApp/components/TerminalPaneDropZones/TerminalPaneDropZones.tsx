import { useDndContext } from '@dnd-kit/core'

import type { TermDropEdge, TermGroupId } from '@/store/terminal-app-store/types'

import { TerminalPaneDropZone } from './TerminalPaneDropZone'

const EDGES: TermDropEdge[] = ['top', 'right', 'bottom', 'left', 'center']

interface Props {
  groupId: TermGroupId
}

/**
 * Overlays the five drop zones (top/right/bottom/left/center) on a pane body.
 * Mounted by `TerminalAppPane`. The overlay only renders while a drag is in
 * progress (pulled from the DnD context), so terminal mouse/selection
 * interactions are completely unimpeded in the steady state. The container is
 * `pointer-events-none`; each zone re-enables pointer events on itself.
 */
export function TerminalPaneDropZones({ groupId }: Props) {
  const ctx = useDndContext()
  if (!ctx.active) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {EDGES.map((edge) => (
        <TerminalPaneDropZone key={edge} groupId={groupId} edge={edge} />
      ))}
    </div>
  )
}
