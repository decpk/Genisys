import type * as monaco from 'monaco-editor'

import { APP_MONACO_SCROLLBAR_OPTIONS } from '@/lib/monaco-theme'

export const DEFAULT_OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions =
  {
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
