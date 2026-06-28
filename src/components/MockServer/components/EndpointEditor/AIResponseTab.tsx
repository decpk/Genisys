import { useState, useCallback, useEffect, useMemo } from 'react'
import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import type * as MonacoType from 'monaco-editor'
import { Sparkles, RotateCcw, Check, GripVertical } from 'lucide-react'

import { cn } from '@/lib/utils'
import { AppLoaderGlyph } from '@/components/AppLoader/AppLoaderGlyph'
import { useThemeStore } from '@/store/theme-store'
import { useSettingsStore } from '@/store/settings-store'
import { THEMES } from '@/themes'
import { APP_MONACO_SCROLLBAR_OPTIONS, defineAppMonacoTheme } from '@/lib/monaco-theme'
import { useResizeHandle } from '@/hooks'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AiModeSelector } from './components/AiModeSelector'
import type { AiResponseMode } from './components/AiModeSelector'
import { AiCacheSettings } from './components/AiCacheSettings'

loader.config({ monaco })

const THEME_ID = 'mock-ai-response-theme'
const PREVIEW_THEME_ID = 'mock-ai-preview-theme'

const RIGHT_PANEL_DEFAULT = 300
const RIGHT_PANEL_MIN = 200
const RIGHT_PANEL_MAX = 500

interface AIResponseTabProps {
  schema: string
  onSchemaChange: (value: string) => void
  prompt: string
  onPromptChange: (value: string) => void
  onAccept: (generatedBody: string) => void
  mode: AiResponseMode
  onModeChange: (mode: AiResponseMode) => void
  cacheTtlMs: number
  onCacheTtlChange: (ms: number) => void
  poolSize: number
  onPoolSizeChange: (size: number) => void
}

/** Detect language from content for syntax highlighting */
function detectLanguage(content: string): string {
  const trimmed = content.trimStart()
  if (!trimmed) return 'plaintext'
  if (trimmed.startsWith('<')) return 'html'
  if (trimmed.startsWith('[') || trimmed.startsWith('{') || trimmed.startsWith('//')) return 'jsonc'
  return 'plaintext'
}

/**
 * Strip a surrounding markdown code fence (```lang ... ```) that the LLM may add
 * around its output. Without this, the fences leak into the response body when
 * "Use This Response" is clicked.
 */
function stripCodeFences(content: string): string {
  const trimmed = content.trim()
  if (!trimmed.startsWith('```')) return trimmed
  const lines = trimmed.split('\n')
  // Drop the opening fence line (``` optionally followed by a language tag)
  lines.shift()
  // Drop the closing fence line if present
  if (lines.length > 0 && lines[lines.length - 1].trim().startsWith('```')) {
    lines.pop()
  }
  return lines.join('\n').trim()
}

const JSON_EXAMPLE = `// array with 50 objects
[
  {
    // type: string
    // Indian names only
    "name": "Rahul Kumar",

    // type: number
    // age between 25 and 40
    "age": 30,

    // type: string
    // valid email based on name
    "email": "rahul@example.com"
  }
]`

const HTML_EXAMPLE = `<!-- Generate 5 card components -->
<div class="card">
  <!-- realistic product name -->
  <h2>Product Name</h2>
  <!-- price between $10-$500 -->
  <p class="price">$49.99</p>
</div>`

function ColorizedCode({ code, language }: { code: string; language: string }) {
  const [html, setHtml] = useState('')

  useEffect(() => {
    let cancelled = false
    monaco.editor.colorize(code, language, { tabSize: 2 }).then((result) => {
      if (!cancelled) setHtml(result)
    })
    return () => { cancelled = true }
  }, [code, language])

  if (!html) {
    return (
      <pre className="rounded-lg border border-border/50 bg-background/60 p-3 text-[11px] leading-[1.7] whitespace-pre-wrap text-foreground/70">
        {code}
      </pre>
    );
  }

  return (
    <div
      className="rounded-lg border border-border/50 bg-background/60 p-3 text-[11px] leading-[1.7] overflow-x-auto whitespace-pre-wrap"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function HelpGuide() {
  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-4 text-xs text-muted-foreground">
      <div>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-foreground/90">
          How to define a template
        </h3>
        <p className="leading-relaxed text-muted-foreground/80">
          Write your response structure in the editor. Use{" "}
          <code className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
            {"//"}
          </code>{" "}
          comments to add constraints and instructions for the AI.
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-foreground/90">
          JSON Example
        </h3>
        <ColorizedCode code={JSON_EXAMPLE} language="jsonc" />
      </div>

      <div>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-foreground/90">
          HTML Example
        </h3>
        <ColorizedCode code={HTML_EXAMPLE} language="html" />
      </div>

      <div>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-foreground/90">
          Key points
        </h3>
        <ul className="flex flex-col gap-1.5 leading-relaxed text-muted-foreground/80">
          <li className="flex gap-2">
            <span className="shrink-0 text-primary/60">•</span>
            Comments are instructions for the AI — they won't appear in output
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-primary/60">•</span>
            Output matches the exact structure you define
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-primary/60">•</span>
            Works with any format: JSON, HTML, XML, CSV, etc.
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-primary/60">•</span>
            Add extra context via the prompt input above the editor
          </li>
        </ul>
      </div>
    </div>
  );
}

type InnerTab = 'template' | 'preview'

export function AIResponseTab(props: AIResponseTabProps) {
  const {
    schema, onSchemaChange,
    prompt, onPromptChange,
    onAccept,
    mode, onModeChange,
    cacheTtlMs, onCacheTtlChange,
    poolSize, onPoolSizeChange,
  } = props

  const [preview, setPreview] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [innerTab, setInnerTab] = useState<InnerTab>('template')
  const [rightPanelWidth, setRightPanelWidth] = useState(RIGHT_PANEL_DEFAULT)

  const activeThemeId = useThemeStore((s) => s.activeThemeId)
  const appTheme = useMemo(() => THEMES.find((t) => t.id === activeThemeId), [activeThemeId])
  const editorFontSize = useSettingsStore((s) => s.editorFontSize)

  // Auto-detect editor language from schema content
  const editorLanguage = useMemo(() => detectLanguage(schema), [schema])

  // Resizable right panel via drag handle
  const { handleMouseDown: handleDragMouseDown } = useResizeHandle({
    width: rightPanelWidth,
    minWidth: RIGHT_PANEL_MIN,
    maxWidth: RIGHT_PANEL_MAX,
    resetWidth: RIGHT_PANEL_DEFAULT,
    direction: 'left',
    onWidthChange: setRightPanelWidth,
  })

  useEffect(() => {
    if (appTheme) {
      defineAppMonacoTheme(THEME_ID, appTheme)
      defineAppMonacoTheme(PREVIEW_THEME_ID, appTheme)
    }
  }, [appTheme])

  const handleBeforeMount = useCallback(
    (m: typeof MonacoType) => {
      if (appTheme) {
        defineAppMonacoTheme(THEME_ID, appTheme)
        defineAppMonacoTheme(PREVIEW_THEME_ID, appTheme)
      } else {
        m.editor.defineTheme(THEME_ID, { base: 'vs-dark', inherit: true, rules: [], colors: {} })
        m.editor.defineTheme(PREVIEW_THEME_ID, { base: 'vs-dark', inherit: true, rules: [], colors: {} })
      }
    },
    [appTheme]
  )

  const monacoLoading = useMemo(() => (
    <div className="flex h-full items-center justify-center rounded-md bg-background">
      <AppLoaderGlyph size={20} />
    </div>
  ), [])

  const handleGenerate = useCallback(async () => {
    if (!schema.trim()) return
    setIsGenerating(true)
    setError('')

    const systemPrompt = `You are a mock data generator. Generate data matching the exact structure of the template below.

Comments (// or <!-- -->) are instructions and constraints — do NOT include them in the output.
Preserve the exact format (JSON, HTML, XML, etc.) of the template.
Only output the generated data, nothing else.
Do NOT wrap the output in markdown code fences (\`\`\`). Return the raw data only.

Template:
${schema}

${prompt ? `Additional instructions: ${prompt}` : ''}`

    const userPrompt = prompt || 'Generate realistic mock data matching the template.'

    try {
      const result = await window.api.llmJsonCompletion({
        systemPrompt,
        userPrompt,
      })
      if (result.success && result.content) {
        setPreview(stripCodeFences(result.content))
        setInnerTab('preview')
      } else {
        setError(result.error ?? 'Generation failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }, [schema, prompt])

  const handleAccept = useCallback(() => {
    if (preview) onAccept(preview)
  }, [preview, onAccept])

  const hasPreview = preview.length > 0

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Response mode + cache/pool settings */}
      <div className="flex shrink-0 flex-wrap items-end gap-4 pb-3">
        <AiModeSelector mode={mode} onModeChange={onModeChange} />
        <AiCacheSettings
          mode={mode}
          cacheTtlMs={cacheTtlMs}
          onCacheTtlChange={onCacheTtlChange}
          poolSize={poolSize}
          onPoolSizeChange={onPoolSizeChange}
        />
      </div>

      {/* Main area: left panel + drag handle + right panel */}
      <div className="flex flex-1 gap-0 overflow-hidden rounded-lg border border-border/60">
        {/* Left panel: Template / Preview with inner tabs */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header with tabs + action buttons */}
          <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-2 py-1.5 bg-muted/20">
            <Tabs value={innerTab} onValueChange={(v) => setInnerTab(v as InnerTab)}>
              <TabsList className="my-0">
                <TabsTrigger value="template">Template</TabsTrigger>
                <TabsTrigger value="preview" disabled={!hasPreview}>
                  Preview
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-1.5">
              {hasPreview && innerTab === 'template' && (
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  Regenerate
                </button>
              )}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !schema.trim()}
                className={cn(
                  'inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-[11px] font-medium transition-all',
                  'bg-primary text-primary-foreground hover:bg-primary/90',
                  'disabled:cursor-not-allowed disabled:opacity-40'
                )}
              >
                {isGenerating ? (
                  <>
                    <AppLoaderGlyph size={12} className="text-primary-foreground" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    Generate Preview
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Template tab content */}
          {innerTab === 'template' && (
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Inline prompt input */}
              <div className="shrink-0 border-b border-border/40 px-3 py-1.5 bg-muted/10">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => onPromptChange(e.target.value)}
                  placeholder="Additional context for AI… (optional)"
                  className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/40"
                />
              </div>
              {/* Monaco editor */}
              <div className="flex-1 overflow-hidden">
                <Editor
                  height="100%"
                  language={editorLanguage}
                  theme={THEME_ID}
                  value={schema}
                  onChange={(v) => onSchemaChange(v ?? '')}
                  loading={monacoLoading}
                  beforeMount={handleBeforeMount}
                  options={{
                    minimap: { enabled: false },
                    fontSize: editorFontSize,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    tabSize: 2,
                    automaticLayout: true,
                    padding: { top: 10, bottom: 10 },
                    lineNumbersMinChars: 3,
                    glyphMargin: false,
                    folding: true,
                    renderLineHighlight: 'line',
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    bracketPairColorization: { enabled: true },
                    scrollbar: APP_MONACO_SCROLLBAR_OPTIONS,
                  }}
                />
              </div>
            </div>
          )}

          {/* Preview tab content */}
          {innerTab === 'preview' && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-hidden">
                <Editor
                  height="100%"
                  language="json"
                  theme={PREVIEW_THEME_ID}
                  value={preview}
                  loading={monacoLoading}
                  beforeMount={handleBeforeMount}
                  options={{
                    minimap: { enabled: false },
                    fontSize: editorFontSize,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    tabSize: 2,
                    automaticLayout: true,
                    readOnly: true,
                    padding: { top: 10, bottom: 10 },
                    lineNumbersMinChars: 3,
                    glyphMargin: false,
                    smoothScrolling: true,
                    renderLineHighlight: 'none',
                    bracketPairColorization: { enabled: true },
                    scrollbar: APP_MONACO_SCROLLBAR_OPTIONS,
                  }}
                />
              </div>
              {/* Use This Response footer */}
              <div className="shrink-0 flex items-center justify-between border-t border-border/60 px-3 py-2 bg-muted/10">
                <span className="text-[11px] text-muted-foreground">
                  {preview.split('\n').length} lines generated
                </span>
                <button
                  onClick={handleAccept}
                  className="inline-flex h-7 items-center gap-1.5 rounded-md bg-primary/15 px-3 text-xs font-medium text-primary hover:bg-primary/25 transition-colors"
                >
                  <Check className="h-3.5 w-3.5" />
                  Use This Response
                </button>
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="shrink-0 border-t border-red-500/20 bg-red-500/5 px-3 py-2">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Drag handle between panels */}
        <div
          className="relative z-10 flex w-[7px] shrink-0 cursor-col-resize items-center justify-center group"
          onMouseDown={handleDragMouseDown}
        >
          <div className="absolute inset-y-0 left-1/2 w-[1px] -translate-x-1/2 bg-border/40 group-hover:bg-primary/50 transition-colors" />
          <GripVertical className="relative h-4 w-3 text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-colors" />
        </div>

        {/* Right panel: Guide */}
        <div
          className="flex shrink-0 flex-col overflow-hidden bg-muted/20"
          style={{ width: rightPanelWidth }}
        >
          <div className="flex shrink-0 items-center border-b border-border/60 px-3 py-2 bg-muted/20">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Guide
            </span>
          </div>
          <HelpGuide />
        </div>
      </div>
    </div>
  )
}
