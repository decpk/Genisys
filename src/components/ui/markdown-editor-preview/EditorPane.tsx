import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'

import { APP_MONACO_SCROLLBAR_OPTIONS } from '@/lib/monaco-theme'
import { useSettingsStore } from '@/store/settings-store'
import { useEditorTheme } from './hooks/useEditorTheme'
import type { EditorPaneProps } from './MarkdownEditorPreview.types'

loader.config({ monaco })

const DEFAULT_OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions = {
  wordWrap: 'on',
  minimap: { enabled: false },
  lineNumbers: 'on',
  fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
  scrollBeyondLastLine: false,
  padding: { top: 16, bottom: 16 },
  renderLineHighlight: 'line',
  bracketPairColorization: { enabled: false },
  guides: { indentation: false },
  folding: true,
  lineDecorationsWidth: 8,
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  overviewRulerBorder: false,
  scrollbar: APP_MONACO_SCROLLBAR_OPTIONS,
}

export function EditorPane(props: EditorPaneProps): React.JSX.Element {
  const { content, onChange, editorOptions, onEditorMount, editorRef } = props
  const { handleEditorMount, themeId } = useEditorTheme(editorRef)
  const editorFontSize = useSettingsStore((s) => s.editorFontSize)

  function handleMount(editor: monaco.editor.IStandaloneCodeEditor) {
    handleEditorMount(editor)
    if (onEditorMount) {
      onEditorMount(editor)
    }
  }

  return (
    <div className="h-full w-full overflow-hidden" data-selection-toolbar>
      <Editor
        language="markdown"
        theme={themeId}
        value={content}
        onChange={(value) => onChange(value ?? '')}
        onMount={handleMount}
        options={{ ...DEFAULT_OPTIONS, fontSize: editorFontSize, ...editorOptions }}
      />
    </div>
  )
}
