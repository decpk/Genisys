import { MultiDirectedGraph } from 'graphology'

import type { NotesLinkGraph } from '@/components/NotesApp/notes-links'
import type { Note } from '@/store/notes-store'

import type {
  NotesGraphEdgeAttrs,
  NotesGraphMultiGraph,
  NotesGraphNodeAttrs,
  NotesGraphScope,
} from '../NotesGraphPanel.types'
import { computeLocalSubgraphIds } from './computeLocalSubgraphIds'
import { nodeColorForState } from './nodeColorForState'
import { runNotesForceAtlas2 } from './runNotesForceAtlas2'

export interface BuildNotesGraphologyGraphParams {
  notes: Note[]
  linkGraph: NotesLinkGraph
  scope: NotesGraphScope
  selectedNoteId: string | null
}

/**
 * Build a graphology MultiDirectedGraph from the notes + wiki-link graph for
 * the requested scope. Seeds deterministic ring positions so ForceAtlas2 does
 * not collapse, then runs the layout in place. May return an empty graph.
 */
export function buildNotesGraphologyGraph(
  params: BuildNotesGraphologyGraphParams,
): NotesGraphMultiGraph {
  const { notes, linkGraph, scope, selectedNoteId } = params
  const g = new MultiDirectedGraph<NotesGraphNodeAttrs, NotesGraphEdgeAttrs>()

  const noteById = new Map<string, Note>()
  for (const note of notes) noteById.set(note.id, note)

  const titled = new Set<string>()
  for (const note of notes) {
    if (note.title.trim().length > 0) titled.add(note.id)
  }

  let includedIds: Set<string> = titled
  if (scope === 'local' && selectedNoteId && titled.has(selectedNoteId)) {
    const local = computeLocalSubgraphIds(linkGraph, selectedNoteId)
    const restricted = new Set<string>()
    for (const id of local) {
      if (titled.has(id) || id === selectedNoteId) restricted.add(id)
    }
    includedIds = restricted
  }

  const ids = Array.from(includedIds)
  const total = Math.max(1, ids.length)

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]
    const note = noteById.get(id)
    if (!note) continue
    const degree = (linkGraph.forward[id]?.length ?? 0) + (linkGraph.backward[id]?.length ?? 0)
    const isSelected = id === selectedNoteId
    const base = 4 + Math.min(degree, 8)
    const angle = (2 * Math.PI * i) / total
    const radius = 100 + (i % 50)
    g.addNode(id, {
      label: note.title.trim() || 'Untitled',
      size: isSelected ? base + 4 : base,
      color: nodeColorForState(isSelected),
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    })
  }

  for (const edge of linkGraph.edges) {
    if (!g.hasNode(edge.source) || !g.hasNode(edge.target)) continue
    const key = `${edge.source}->${edge.target}`
    if (g.hasEdge(key)) continue
    g.addEdgeWithKey(key, edge.source, edge.target, {})
  }

  runNotesForceAtlas2(g)
  return g
}
