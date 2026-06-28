import { useState, useMemo, useEffect, lazy, Suspense } from 'react'
import { Code, TreePine, WandSparkles } from 'lucide-react'
import { JsonViewer } from '../JsonViewer'
import { AppInlineLoader } from '@/components/AppLoader'
import { useThemeStore } from '@/store/theme-store'
import { useSettingsStore } from '@/store/settings-store'
import { THEMES } from '@/themes'
import { APP_MONACO_SCROLLBAR_OPTIONS, defineAppMonacoTheme } from '@/lib/monaco-theme'
import { detectLanguage } from '../../utils/detect-language'
import type { BodyType } from '../../APIClient.types'

const BODY_EDITOR_THEME_ID = 'api-client-body-editor'

const LazyEditor = lazy(() =>
  Promise.all([import('@monaco-editor/react'), import('monaco-editor')]).then(
    ([editorModule, monacoModule]) => {
      editorModule.loader.config({ monaco: monacoModule })
      return { default: editorModule.default }
    },
  ),
)

interface BodyEditorProps {
  bodyType: BodyType
  bodyContent: string
  onTypeChange: (type: BodyType) => void
  onContentChange: (content: string) => void
}

const BODY_TYPES: { value: BodyType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'json', label: 'JSON' },
  { value: 'raw', label: 'Raw' },
  { value: 'form-data', label: 'Form Data' },
  { value: 'xml', label: 'XML' },
]

export function BodyEditor(props: BodyEditorProps): React.JSX.Element {
  const { bodyType, bodyContent, onTypeChange, onContentChange } = props
  const [showPreview, setShowPreview] = useState(false)

  const activeThemeId = useThemeStore((s) => s.activeThemeId)
  const editorFontSize = useSettingsStore((s) => s.editorFontSize)
  const appTheme = useMemo(
    () => THEMES.find((t) => t.id === activeThemeId),
    [activeThemeId],
  )

  useEffect(() => {
    if (appTheme) defineAppMonacoTheme(BODY_EDITOR_THEME_ID, appTheme)
  }, [appTheme])

  const isValidJson = useMemo(() => {
    if (bodyType !== 'json' || !bodyContent.trim()) return false
    try {
      JSON.parse(bodyContent)
      return true
    } catch {
      return false
    }
  }, [bodyType, bodyContent])

  const handleFormat = (): void => {
    if (!isValidJson) return
    try {
      const formatted = JSON.stringify(JSON.parse(bodyContent), null, 2)
      if (formatted !== bodyContent) onContentChange(formatted)
    } catch {
      // ignore — invalid JSON cannot be formatted
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Type selector — segment control */}
      <div className="flex items-center gap-2.5 px-3 py-2 border-b border-border/30">
        <div className="flex items-center rounded-lg bg-foreground/[0.07] border border-border/50 p-0.5 gap-0.5 shadow-sm">
          {BODY_TYPES.map((bt) => (
            <button
              key={bt.value}
              onClick={() => {
                onTypeChange(bt.value)
                setShowPreview(false)
              }}
              className={`px-2.5 py-1 text-xs rounded-md transition-all cursor-pointer ${
                bodyType === bt.value
                  ? 'bg-background text-foreground shadow-sm font-medium border border-border/30'
                  : 'text-muted-foreground hover:text-foreground border border-transparent'
              }`}
            >
              {bt.label}
            </button>
          ))}
        </div>

        {/* JSON preview toggle */}
        {bodyType === 'json' && bodyContent.trim() && (
          <>
            <div className="ml-auto" />
            <div className="flex items-center gap-1 rounded-lg bg-foreground/[0.07] border border-border/50 p-0.5 shadow-sm">
              {!showPreview && (
                <button
                  onClick={handleFormat}
                  disabled={!isValidJson}
                  title={isValidJson ? 'Format JSON' : 'Invalid JSON cannot be formatted'}
                  className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-md text-muted-foreground transition-all cursor-pointer hover:text-foreground hover:bg-background/80 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <WandSparkles size={10} />
                  Format
                </button>
              )}
              <button
                onClick={() => setShowPreview(false)}
                className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-md transition-all cursor-pointer ${
                  !showPreview
                    ? 'bg-background text-foreground shadow-sm border border-border/30'
                    : 'text-muted-foreground hover:text-foreground border border-transparent'
                }`}
              >
                <Code size={10} />
                Raw
              </button>
              <button
                onClick={() => setShowPreview(true)}
                disabled={!isValidJson}
                className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  showPreview
                    ? 'bg-background text-foreground shadow-sm border border-border/30'
                    : 'text-muted-foreground hover:text-foreground border border-transparent'
                }`}
              >
                <TreePine size={10} />
                Parsed
              </button>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      {bodyType === 'none' ? (
        <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
          This request does not have a body
        </div>
      ) : showPreview && bodyType === 'json' && isValidJson ? (
        <div className="flex-1 min-h-0">
          <JsonViewer data={bodyContent} viewMode="parsed" />
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <Suspense
            fallback={<AppInlineLoader message="Loading editor..." size={14} className="h-full" />}
          >
            <LazyEditor
              value={bodyContent}
              onChange={(value) => onContentChange(value ?? '')}
              language={detectLanguage(bodyContent)}
              theme={BODY_EDITOR_THEME_ID}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: editorFontSize,
                lineNumbers: 'off',
                renderLineHighlight: 'none',
                contextmenu: false,
                folding: true,
                wordWrap: 'on',
                formatOnPaste: true,
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
      )}
    </div>
  )
}
