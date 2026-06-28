import { useRef } from 'react'
import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'

import { useSettingsStore } from '@/store/settings-store'
import { useEditorTheme } from '@/components/ui/markdown-editor-preview/hooks/useEditorTheme'

import type { HtmlEditorPaneProps } from './HtmlEditorPane.types'
import { DEFAULT_OPTIONS } from './HtmlEditorPane.constants'

loader.config({ monaco })

/**
 * A full-height Monaco editor configured for HTML editing. Mirrors the
 * markdown `EditorPane` (same theme + options) but locks the language to
 * `html` for editing saved HTML pages.
 */
export function HtmlEditorPane(props: HtmlEditorPaneProps): React.JSX.Element {
  const { content, onChange, onEditorMount } = props
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const { handleEditorMount, themeId } = useEditorTheme(editorRef)
  const editorFontSize = useSettingsStore((s) => s.editorFontSize)

  function handleMount(editor: monaco.editor.IStandaloneCodeEditor): void {
    handleEditorMount(editor)
    if (onEditorMount) {
      onEditorMount(editor)
    }
  }

  function handleChange(value: string | undefined): void {
    onChange(value ?? '')
  }

  return (
    <div className="h-full w-full overflow-hidden" data-selection-toolbar>
      <Editor
        language="html"
        theme={themeId}
        value={content}
        onChange={handleChange}
        onMount={handleMount}
        options={{ ...DEFAULT_OPTIONS, fontSize: editorFontSize }}
      />
    </div>
  )
}
