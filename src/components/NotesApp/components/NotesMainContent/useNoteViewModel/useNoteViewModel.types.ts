/** Resolved, display-ready data for a single note shown in a pane. */
export interface NoteViewModel {
  breadcrumb: string[]
  noteLabels: NoteLabelSummary[]
  allLabels: NoteLabelSummary[]
  sourceInfo: NoteSourceInfo | null
}

export interface NoteLabelSummary {
  id: string
  name: string
  color: string | null
}

export interface NoteSourceInfo {
  appId: string
  label: string
  contextId?: string
  contextLabel?: string
}
