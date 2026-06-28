import type * as monaco from 'monaco-editor'

export interface HtmlEditorPaneProps {
  content: string
  onChange: (value: string) => void
  onEditorMount?: (editor: monaco.editor.IStandaloneCodeEditor) => void
}
