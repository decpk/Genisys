export interface ClipboardLabel {
  id: string
  name: string
  color: string
  createdAt: string
}

export interface ClipboardLabelState {
  labels: ClipboardLabel[]
  isLoaded: boolean
}

export interface ClipboardLabelActions {
  loadLabels: () => Promise<void>
  createLabel: (name: string, color: string) => Promise<ClipboardLabel>
  updateLabel: (id: string, name: string, color: string) => Promise<void>
  deleteLabel: (id: string) => Promise<{ success: boolean; affectedCount: number }>
  addLabelToItem: (itemId: string, labelId: string) => Promise<void>
  removeLabelFromItem: (itemId: string, labelId: string) => Promise<void>
}

export type ClipboardLabelStore = ClipboardLabelState & ClipboardLabelActions
