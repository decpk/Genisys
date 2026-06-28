import type { TermDropEdge, TermGroupId } from '@/store/terminal-app-store/types'

const TAB_PREFIX = 'ttab:'
const ZONE_PREFIX = 'tdz:'

const VALID_EDGES: ReadonlySet<TermDropEdge> = new Set([
  'top',
  'right',
  'bottom',
  'left',
  'center',
])

export interface ParsedTerminalTabId {
  groupId: TermGroupId
  tabId: string
}

export interface ParsedTerminalDropZoneId {
  groupId: TermGroupId
  edge: TermDropEdge
}

/**
 * dnd-kit sortable id for a terminal tab inside a specific pane.
 * Format: `ttab:<groupId>:<tabId>`. `groupId` (`tg-…`) never contains a `:`,
 * so the part after the first `:` is the (possibly `:`-bearing) session id.
 */
export function buildTerminalTabSortableId(groupId: TermGroupId, tabId: string): string {
  return `${TAB_PREFIX}${groupId}:${tabId}`
}

export function parseTerminalTabSortableId(id: string): ParsedTerminalTabId | null {
  if (!id.startsWith(TAB_PREFIX)) return null
  const rest = id.slice(TAB_PREFIX.length)
  const firstColon = rest.indexOf(':')
  if (firstColon < 0) return null
  const groupId = rest.slice(0, firstColon)
  const tabId = rest.slice(firstColon + 1)
  if (!groupId || !tabId) return null
  return { groupId, tabId }
}

/**
 * dnd-kit droppable id for a pane's drop zone.
 * Format: `tdz:<groupId>:<edge>` — split at the last `:` so the trailing
 * edge token is recovered while `groupId` stays intact.
 */
export function buildTerminalDropZoneId(groupId: TermGroupId, edge: TermDropEdge): string {
  return `${ZONE_PREFIX}${groupId}:${edge}`
}

export function parseTerminalDropZoneId(id: string): ParsedTerminalDropZoneId | null {
  if (!id.startsWith(ZONE_PREFIX)) return null
  const body = id.slice(ZONE_PREFIX.length)
  const lastColon = body.lastIndexOf(':')
  if (lastColon < 0) return null
  const groupId = body.slice(0, lastColon)
  const edge = body.slice(lastColon + 1) as TermDropEdge
  if (!groupId || !VALID_EDGES.has(edge)) return null
  return { groupId, edge }
}
