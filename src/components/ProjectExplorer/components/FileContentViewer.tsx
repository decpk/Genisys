import { useEffect, useMemo, useCallback, useState } from 'react'
import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { Eye, Code2 } from 'lucide-react'

import { Tooltip } from '@/components/Tooltip'
import { useThemeStore } from '@/store/theme-store'
import { useSettingsStore } from '@/store/settings-store'
import { THEMES } from '@/themes'
import { getLanguageFromPath } from '@/components/DiffViewer/DiffViewer.utils'
import { APP_MONACO_SCROLLBAR_OPTIONS, defineAppMonacoTheme } from '@/lib/monaco-theme'
import { FilePreview, isPreviewable } from './FilePreview'

loader.config({ monaco })

const THEME_ID = 'explorer-viewer-theme'

interface FileContentViewerProps {
  path: string
  content: string
}

const LANG_TO_PARSER: Record<string, string> = {
  json: 'json',
  html: 'html',
  xml: 'xml',
  svg: 'html',
  markdown: 'markdown',
  yaml: 'yaml',
  css: 'css',
  less: 'less',
  scss: 'scss',
  typescript: 'babel-ts',
  javascript: 'babel',
  typescriptreact: 'babel-ts',
  javascriptreact: 'babel'
}

import type { Plugin } from 'prettier'

type ParserGroup = 'js' | 'html' | 'markdown' | 'yaml' | 'css' | 'xml' | 'json'

const PARSER_TO_GROUP: Record<string, ParserGroup> = {
  babel: 'js',
  'babel-ts': 'js',
  json: 'json',
  html: 'html',
  xml: 'xml',
  markdown: 'markdown',
  yaml: 'yaml',
  css: 'css',
  less: 'css',
  scss: 'css'
}

async function loadPluginsForParser(parser: string): Promise<Plugin[]> {
  const group = PARSER_TO_GROUP[parser]
  if (!group) return []

  // estree is always needed as a base plugin
  const estree = import('prettier/plugins/estree')

  switch (group) {
    case 'js':
    case 'json':
      return Promise.all([import('prettier/plugins/babel'), estree]).then(([b, e]) => [
        b.default,
        e.default
      ])
    case 'html':
      return import('prettier/plugins/html').then((m) => [m.default])
    case 'markdown':
      return import('prettier/plugins/markdown').then((m) => [m.default])
    case 'yaml':
      return import('prettier/plugins/yaml').then((m) => [m.default])
    case 'css':
      return import('prettier/plugins/postcss').then((m) => [m.default])
    case 'xml':
      return import('@prettier/plugin-xml').then((m) => [m.default])
  }
}

function usePrettierFormat(content: string, language: string): string {
  const [formatted, setFormatted] = useState(content)

  useEffect(() => {
    const parser = LANG_TO_PARSER[language]
    if (!parser) {
      setFormatted(content)
      return
    }

    let cancelled = false

    Promise.all([import('prettier/standalone'), loadPluginsForParser(parser)])
      .then(([prettier, plugins]) =>
        prettier.format(content, {
          parser,
          plugins,
          printWidth: 100,
          tabWidth: 2,
          singleQuote: true,
          trailingComma: 'none'
        })
      )
      .then((result) => {
        if (!cancelled) setFormatted(result)
      })
      .catch(() => {
        if (!cancelled) setFormatted(content)
      })

    return () => {
      cancelled = true
    }
  }, [content, language])

  return formatted
}

export function FileContentViewer({ path, content }: FileContentViewerProps): React.JSX.Element {
  const fileName = path.split('/').pop() ?? path
  const language = useMemo(() => getLanguageFromPath(path), [path])
  const formatted = usePrettierFormat(content, language)
  const canPreview = useMemo(() => isPreviewable(path), [path])
  const [showPreview, setShowPreview] = useState(false)
  const activeThemeId = useThemeStore((s) => s.activeThemeId)
  const editorFontSize = useSettingsStore((s) => s.editorFontSize)
  const appTheme = useMemo(() => THEMES.find((t) => t.id === activeThemeId), [activeThemeId])

  const handleMount = useCallback(() => {
    if (!appTheme) return
    defineAppMonacoTheme(THEME_ID, appTheme)
  }, [appTheme])

  useEffect(() => {
    handleMount()
  }, [handleMount])

  return (
    <div className="flex flex-col flex-1 overflow-hidden" data-selection-toolbar>
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border/20 shrink-0">
        {canPreview && (
          <Tooltip content={showPreview ? 'Show source' : 'Show preview'} side="bottom">
            <button
              onClick={() => setShowPreview((v) => !v)}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                showPreview
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {showPreview ? <Code2 size={14} /> : <Eye size={14} />}
            </button>
          </Tooltip>
        )}
        <span className="text-sm font-medium text-foreground">{fileName}</span>
      </div>
      {showPreview && canPreview ? (
        <FilePreview path={path} content={content} />
      ) : (
        <Editor
          value={formatted}
          language={language}
          theme={THEME_ID}
          options={{
            readOnly: true,
            domReadOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: editorFontSize,
            lineNumbers: 'on',
            renderLineHighlight: 'line',
            contextmenu: false,
            folding: true,
            wordWrap: 'on',
            automaticLayout: true,
            scrollbar: APP_MONACO_SCROLLBAR_OPTIONS
          }}
          onMount={handleMount}
        />
      )}
    </div>
  )
}
