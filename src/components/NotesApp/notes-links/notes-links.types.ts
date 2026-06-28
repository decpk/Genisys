export interface NotesLinkEdge {
  source: string
  target: string
}

export interface NotesLinkGraph {
  /** noteId -> outgoing target note ids (deduped). */
  forward: Record<string, string[]>
  /** noteId -> incoming source note ids (deduped). */
  backward: Record<string, string[]>
  /** Flat list of directed link edges. */
  edges: NotesLinkEdge[]
  /** Normalized title -> noteId (first writer wins). */
  titleToId: Record<string, string>
}

/** A note reference with a short contextual snippet, used by panels. */
export interface NoteRef {
  noteId: string
  title: string
  snippet: string
}
