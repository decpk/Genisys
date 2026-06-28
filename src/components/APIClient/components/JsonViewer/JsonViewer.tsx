import { memo, useMemo, useEffect, lazy, Suspense } from 'react'
import { JsonView } from 'react-json-view-lite'
import type { StyleProps } from 'react-json-view-lite/dist/DataRenderer'
import { useThemeStore } from '@/store/theme-store'
import { useSettingsStore } from '@/store/settings-store'
import { THEMES } from '@/themes'
import { APP_MONACO_SCROLLBAR_OPTIONS, defineAppMonacoTheme } from '@/lib/monaco-theme'
import { detectLanguage } from '../../utils/detect-language'

const JSON_VIEWER_THEME_ID = 'api-client-json-viewer'

const LazyEditor = lazy(() =>
  Promise.all([import('@monaco-editor/react'), import('monaco-editor')]).then(
    ([editorModule, monacoModule]) => {
      editorModule.loader.config({ monaco: monacoModule })
      return { default: editorModule.default }
    },
  ),
)

export type ViewMode = 'parsed' | 'raw'

interface JsonViewerProps {
  data: string
  viewMode: ViewMode
}

const LARGE_THRESHOLD = 100_000

const DEFAULT_EXPAND_DEPTH = 3
const shouldExpandNode = (level: number): boolean => level < DEFAULT_EXPAND_DEPTH

const JSON_VIEW_STYLES: StyleProps = {
  container: 'jv-container',
  basicChildStyle: 'jv-child',
  label: 'jv-key',
  clickableLabel: 'jv-key jv-clickable',
  nullValue: 'jv-null',
  undefinedValue: 'jv-undefined',
  numberValue: 'jv-number',
  stringValue: 'jv-string',
  booleanValue: 'jv-boolean',
  otherValue: 'jv-other',
  punctuation: 'jv-bracket',
  expandIcon: 'jv-expand-icon',
  collapseIcon: 'jv-collapse-icon',
  collapsedContent: 'jv-collapsed',
  childFieldsContainer: 'jv-fields',
  noQuotesForStringValues: false,
  quotesForFieldNames: false,
  stringifyStringValues: false,
  ariaLables: { collapseJson: 'Collapse', expandJson: 'Expand' },
}

export const JsonViewer = memo(function JsonViewer(props: JsonViewerProps): React.JSX.Element {
  const { data, viewMode } = props

  const isLarge = data.length > LARGE_THRESHOLD

  const activeThemeId = useThemeStore((s) => s.activeThemeId)
  const editorFontSize = useSettingsStore((s) => s.editorFontSize)
  const appTheme = useMemo(
    () => THEMES.find((t) => t.id === activeThemeId),
    [activeThemeId],
  )

  useEffect(() => {
    if (appTheme) defineAppMonacoTheme(JSON_VIEWER_THEME_ID, appTheme)
  }, [appTheme])

  const formatted = useMemo(() => {
    try {
      return JSON.stringify(JSON.parse(data), null, 2)
    } catch {
      return data
    }
  }, [data])

  const parsedData = useMemo(() => {
    if (isLarge) return null
    try {
      return JSON.parse(data)
    } catch {
      return null
    }
  }, [data, isLarge])

  const canParse = parsedData !== null

  return (
    <div className="flex flex-col h-full">
      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {viewMode === 'parsed' && canParse ? (
          <div className="p-2 text-xs">
            <JsonView
              data={parsedData}
              shouldExpandNode={shouldExpandNode}
              clickToExpandNode
              style={JSON_VIEW_STYLES}
            />
          </div>
        ) : (
          <Suspense
            fallback={
              <pre className="p-3 text-xs font-sans text-foreground whitespace-pre-wrap break-all">
                {formatted}
              </pre>
            }
          >
            <LazyEditor
              value={formatted}
              language={detectLanguage(formatted)}
              theme={JSON_VIEWER_THEME_ID}
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
        )}
      </div>
    </div>
  )
})
