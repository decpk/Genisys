import React, { lazy, Suspense, useEffect, useMemo } from 'react'
import { JsonViewer, type ViewMode } from '../JsonViewer'
import { AppInlineLoader } from '@/components/AppLoader'
import { useThemeStore } from '@/store/theme-store'
import { useSettingsStore } from '@/store/settings-store'
import { THEMES } from '@/themes'
import { APP_MONACO_SCROLLBAR_OPTIONS, defineAppMonacoTheme } from '@/lib/monaco-theme'
import { formatResponseBody } from '../../utils/format-response'
import { detectLanguage } from '../../utils/detect-language'

const RESPONSE_EDITOR_THEME_ID = 'api-client-response-editor'

const LazyEditor = lazy(() =>
  Promise.all([import('@monaco-editor/react'), import('monaco-editor')]).then(
    ([editorModule, monacoModule]) => {
      editorModule.loader.config({ monaco: monacoModule })
      return { default: editorModule.default }
    },
  ),
)

interface ResponseBodyProps {
  body: string
  contentType?: string
  viewMode: ViewMode
}

export function ResponseBody(props: ResponseBodyProps): React.JSX.Element {
  const { body, contentType, viewMode } = props

  const activeThemeId = useThemeStore((s) => s.activeThemeId)
  const editorFontSize = useSettingsStore((s) => s.editorFontSize)
  const appTheme = useMemo(
    () => THEMES.find((t) => t.id === activeThemeId),
    [activeThemeId],
  )

  useEffect(() => {
    if (appTheme) defineAppMonacoTheme(RESPONSE_EDITOR_THEME_ID, appTheme)
  }, [appTheme])

  const isJson = useMemo(() => {
    if (contentType?.includes('json')) return true
    const trimmed = body.trim()
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        JSON.parse(body)
        return true
      } catch {
        return false
      }
    }
    return false
  }, [body, contentType])

  const formatted = useMemo(() => formatResponseBody(body, contentType), [body, contentType])

  if (!body) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
        Empty response body
      </div>
    )
  }

  if (isJson && viewMode === 'parsed') {
    return (
      <div className="h-full">
        <JsonViewer data={body} viewMode={viewMode} />
      </div>
    )
  }

  const language = isJson ? 'json' : detectLanguage(formatted)

  return (
    <div className="h-full min-h-0">
      <Suspense
        fallback={<AppInlineLoader message="Loading editor..." size={14} className="h-full" />}
      >
        <LazyEditor
          value={formatted}
          language={language}
          theme={RESPONSE_EDITOR_THEME_ID}
          options={{
            readOnly: true,
            domReadOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: editorFontSize,
            lineNumbers: 'off',
            renderLineHighlight: 'none',
            contextmenu: false,
            folding: true,
            wordWrap: 'on',
            scrollbar: APP_MONACO_SCROLLBAR_OPTIONS,
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            guides: { indentation: false },
            padding: { top: 8, bottom: 8 },
            tabSize: 2,
            automaticLayout: true,
          }}
        />
      </Suspense>
    </div>
  )
}
