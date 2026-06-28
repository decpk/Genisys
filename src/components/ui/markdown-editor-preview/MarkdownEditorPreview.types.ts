import type * as monaco from 'monaco-editor'

import type { MarkdownVariant } from '@/components/ui/markdown-renderer/MarkdownRenderer.types'

export interface RenderPreviewProps {
  content: string
  ref: React.Ref<HTMLDivElement>
}

export interface MarkdownEditorPreviewProps {
  content: string
  onChange: (value: string) => void
  header?: React.ReactNode
  footer?: React.ReactNode
  leftPaneLabel?: string
  rightPaneLabel?: string
  showPaneLabels?: boolean
  defaultSplitFraction?: number
  minSplitFraction?: number
  maxSplitFraction?: number
  scrollSyncEnabled?: boolean
  editorOptions?: monaco.editor.IStandaloneEditorConstructionOptions
  onEditorMount?: (editor: monaco.editor.IStandaloneCodeEditor) => void
  renderPreview?: (props: RenderPreviewProps) => React.ReactNode
  previewVariant?: MarkdownVariant
  previewClassName?: string
  className?: string
}

export interface PaneLabelsProps {
  leftPercent: string
  rightPercent: string
  leftLabel: string
  rightLabel: string
  scrollSyncEnabled?: boolean
  onScrollSyncToggle?: () => void
}

export interface ResizeDividerProps {
  onMouseDown: (e: React.MouseEvent) => void
}

export interface EditorPaneProps {
  content: string
  onChange: (value: string) => void
  editorOptions?: monaco.editor.IStandaloneEditorConstructionOptions
  onEditorMount?: (editor: monaco.editor.IStandaloneCodeEditor) => void
  editorRef: React.MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>
}

export interface PreviewPaneProps {
  content: string
  variant?: MarkdownVariant
  className?: string
}
