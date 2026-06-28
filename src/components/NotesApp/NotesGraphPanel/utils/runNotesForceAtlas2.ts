import forceAtlas2 from 'graphology-layout-forceatlas2'

import type { NotesGraphMultiGraph } from '../NotesGraphPanel.types'

const DEFAULT_ITERATIONS = 200

/**
 * Mutate `graph` in place by assigning x/y from a ForceAtlas2 run. Settings are
 * inferred from the graph topology. Guards the empty-graph case.
 */
export function runNotesForceAtlas2(
  graph: NotesGraphMultiGraph,
  iterations: number = DEFAULT_ITERATIONS,
): void {
  if (graph.order === 0) return
  const settings = forceAtlas2.inferSettings(graph)
  forceAtlas2.assign(graph, { iterations, settings })
}
