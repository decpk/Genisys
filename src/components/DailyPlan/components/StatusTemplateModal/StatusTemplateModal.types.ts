export interface StatusTemplateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export interface StatusTemplateModalData {
  editingContent: string
  isDirty: boolean
  savedTemplate: string | null
}

export interface StatusTemplateModalActions {
  setEditingContent: (content: string) => void
  handleSave: () => void
  handleResetToDefault: () => void
  handleRequestClose: () => void
}
