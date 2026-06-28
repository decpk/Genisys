export type WebpointEditorMode = 'edit' | 'preview'

export interface WebpointToolbarProps {
  title: string
  mode: WebpointEditorMode
  onBack: () => void
  onModeChange: (mode: WebpointEditorMode) => void
}
