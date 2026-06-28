import type { NotesLinkGraph } from '@/components/NotesApp/notes-links'

/**
 * Collect the focus note plus its 1-hop neighbors (forward + backward links)
 * for the "local" graph scope.
 */
export function computeLocalSubgraphIds(graph: NotesLinkGraph, focusId: string): Set<string> {
  const ids = new Set<string>([focusId])
  for (const target of graph.forward[focusId] ?? []) ids.add(target)
  for (const source of graph.backward[focusId] ?? []) ids.add(source)
  return ids
}
