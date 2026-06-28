import type { TermDropEdge } from '@/store/terminal-app-store/types'

const POSITION_CLASSES: Record<TermDropEdge, string> = {
  top: 'absolute inset-x-0 top-0 h-1/4',
  bottom: 'absolute inset-x-0 bottom-0 h-1/4',
  left: 'absolute inset-y-0 left-0 w-1/4',
  right: 'absolute inset-y-0 right-0 w-1/4',
  center: 'absolute inset-1/4',
}

/** Tailwind position classes for a pane drop zone, keyed by edge. */
export function getTerminalDropZonePositionClass(edge: TermDropEdge): string {
  return POSITION_CLASSES[edge]
}
