import { DiffEditor, loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'

import { AppInlineLoader } from '@/components/AppLoader'
import { ErrorMessage } from '@/components/ui/error-message'
import { APP_MONACO_SCROLLBAR_OPTIONS } from '@/lib/monaco-theme'

import { TerminalDiffOverlayHeader } from './components/TerminalDiffOverlayHeader'
import { useTerminalDiffOverlayData } from './hooks/useTerminalDiffOverlayData'
import { terminalDiffOverlayStyles as s } from './TerminalDiffOverlay.styles'
import type { TerminalDiffOverlayProps } from './TerminalDiffOverlay.types'

// Use the app-bundled monaco instance (not the CDN default).
loader.config({ monaco })

/**
 * Floating git diff viewer rendered on top of a terminal pane. Opened by
 * clicking a file in that pane's git panel; dismissed with Esc, the close
 * button, or clicking the dimmed backdrop.
 */
export function TerminalDiffOverlay(props: TerminalDiffOverlayProps) {
  const { leafId } = props
  const data = useTerminalDiffOverlayData(leafId)

  if (!data.isOpen) return null

  const isEmpty = !data.original && !data.modified
  let body = (
    <div className={s.editorWrap}>
      <DiffEditor
        height="100%"
        language={data.language}
        original={data.original}
        modified={data.modified}
        theme={data.themeId}
        onMount={data.onEditorMount}
        options={{
          readOnly: true,
          renderSideBySide: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: data.editorFontSize,
          lineNumbers: 'on',
          folding: true,
          wordWrap: 'off',
          contextmenu: false,
          renderOverviewRuler: false,
          scrollbar: APP_MONACO_SCROLLBAR_OPTIONS,
        }}
        key={data.filePath}
      />
    </div>
  )
  if (data.isLoading && isEmpty) {
    body = (
      <div className={s.stateWrap}>
        <AppInlineLoader size={16} message="Loading diff…" />
      </div>
    )
  } else if (data.error) {
    body = (
      <div className={s.stateWrap}>
        <ErrorMessage message={data.error} />
      </div>
    )
  }

  return (
    <div className={s.scrim} onClick={data.onClose}>
      <div className={s.card} onClick={(e) => e.stopPropagation()}>
        <TerminalDiffOverlayHeader filePath={data.filePath} onClose={data.onClose} />
        {body}
      </div>
    </div>
  )
}
