import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { GitCommitHorizontal, Copy } from 'lucide-react'
import { DiffEditor, loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('explorer')

import { Tooltip } from '@/components/Tooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { AppInlineLoader } from '@/components/AppLoader'
import { ErrorMessage } from '@/components/ui/error-message'
import { EmptyState } from '@/components/ui/empty-state'
import { Slider } from '@/components/ui/slider'
import { useThemeStore } from '@/store/theme-store'
import { useSettingsStore } from '@/store/settings-store'
import { THEMES } from '@/themes'
import { APP_MONACO_SCROLLBAR_OPTIONS, defineAppMonacoTheme } from '@/lib/monaco-theme'
import { getLanguageFromPath } from '@/components/DiffViewer/DiffViewer.utils'
import type { FileHistoryModalProps, FileHistoryEntry } from './FileHistoryPanel.types'

loader.config({ monaco })

const CUSTOM_THEME_ID = 'genisys-history-theme'

function copyWithToast(text: string, label: string): void {
  navigator.clipboard.writeText(text)
  toast.success(`${label} copied to clipboard`)
}

export function FileHistoryModal({
  open,
  onOpenChange,
  filePath,
  rootPath
}: FileHistoryModalProps): React.JSX.Element {
  const [commits, setCommits] = useState<FileHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (!open) return
    setIsLoading(true)
    setError(null)
    setSelectedIndex(0)

    window.api
      .getLocalFileGitHistory({ rootPath, filePath })
      .then((result) => {
        if (result.success) {
          setCommits(result.data ?? [])
        } else {
          setError(result.error ?? 'Failed to load history')
        }
      })
      .finally(() => setIsLoading(false))
  }, [open, rootPath, filePath])

  const fileName = filePath.split('/').pop() ?? filePath

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] sm:max-w-[95vw] w-[95vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden"
        showCloseButton
      >
        <DialogHeader className="px-4 pt-4 pb-2 shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <GitCommitHorizontal className="size-5 text-info" />
            {fileName}
            <span className="text-sm font-normal text-muted-foreground">(Git History)</span>
            {commits.length > 0 && (
              <span className="text-xs font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                {commits.length} {commits.length === 1 ? 'commit' : 'commits'}
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Git history timeline for {fileName}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <AppInlineLoader message="Loading history…" size={20} className="flex-1" />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : commits.length === 0 ? (
          <EmptyState message="No git history found" className="flex-1 justify-center" />
        ) : (
          <HistoryContent
            commits={commits}
            selectedIndex={selectedIndex}
            onSelectIndex={setSelectedIndex}
            filePath={filePath}
            rootPath={rootPath}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function HistoryContent({
  commits,
  selectedIndex,
  onSelectIndex,
  filePath,
  rootPath
}: {
  commits: FileHistoryEntry[]
  selectedIndex: number
  onSelectIndex: (i: number) => void
  filePath: string
  rootPath: string
}): React.JSX.Element {
  const [original, setOriginal] = useState('')
  const [modified, setModified] = useState('')
  const [diffLoading, setDiffLoading] = useState(true)

  const activeThemeId = useThemeStore((s) => s.activeThemeId)
  const appTheme = useMemo(() => THEMES.find((t) => t.id === activeThemeId), [activeThemeId])
  const editorFontSize = useSettingsStore((s) => s.editorFontSize)
  const language = useMemo(() => getLanguageFromPath(filePath), [filePath])

  const diffEditorRef = useRef<monaco.editor.IStandaloneDiffEditor | null>(null)
  const origDecorationsRef = useRef<monaco.editor.IEditorDecorationsCollection | null>(null)
  const modDecorationsRef = useRef<monaco.editor.IEditorDecorationsCollection | null>(null)

  const applyDimAndScroll = useCallback((editor: monaco.editor.IStandaloneDiffEditor) => {
    origDecorationsRef.current?.clear()
    modDecorationsRef.current?.clear()

    const origEditor = editor.getOriginalEditor()
    const modEditor = editor.getModifiedEditor()
    const changes = editor.getLineChanges()

    if (!changes || changes.length === 0) return

    const origLineCount = origEditor.getModel()?.getLineCount() ?? 0
    const modLineCount = modEditor.getModel()?.getLineCount() ?? 0

    const origChangedLines = new Set<number>()
    const modChangedLines = new Set<number>()

    for (const change of changes) {
      for (let l = change.originalStartLineNumber; l <= change.originalEndLineNumber; l++) {
        origChangedLines.add(l)
      }
      for (let l = change.modifiedStartLineNumber; l <= change.modifiedEndLineNumber; l++) {
        modChangedLines.add(l)
      }
    }

    const origDecorations: monaco.editor.IModelDeltaDecoration[] = []
    for (let l = 1; l <= origLineCount; l++) {
      if (!origChangedLines.has(l)) {
        origDecorations.push({
          range: new monaco.Range(l, 1, l, Number.MAX_SAFE_INTEGER),
          options: { inlineClassName: 'dim-unchanged-line' }
        })
      }
    }

    const modDecorations: monaco.editor.IModelDeltaDecoration[] = []
    for (let l = 1; l <= modLineCount; l++) {
      if (!modChangedLines.has(l)) {
        modDecorations.push({
          range: new monaco.Range(l, 1, l, Number.MAX_SAFE_INTEGER),
          options: { inlineClassName: 'dim-unchanged-line' }
        })
      }
    }

    origDecorationsRef.current = origEditor.createDecorationsCollection(origDecorations)
    modDecorationsRef.current = modEditor.createDecorationsCollection(modDecorations)

    // Scroll to first change
    const first = changes[0]
    const modTarget = first.modifiedStartLineNumber > 0 ? first.modifiedStartLineNumber : 1
    const origTarget = first.originalStartLineNumber > 0 ? first.originalStartLineNumber : 1
    modEditor.revealLineInCenter(Math.max(1, modTarget - 3))
    origEditor.revealLineInCenter(Math.max(1, origTarget - 3))
  }, [])

  const handleEditorMount = useCallback(
    (editor: monaco.editor.IStandaloneDiffEditor) => {
      diffEditorRef.current = editor
      if (appTheme) {
        defineAppMonacoTheme(CUSTOM_THEME_ID, appTheme, { includeDiffColors: true })
      }
      setTimeout(() => applyDimAndScroll(editor), 300)
    },
    [appTheme, applyDimAndScroll]
  )

  useEffect(() => {
    if (appTheme) {
      defineAppMonacoTheme(CUSTOM_THEME_ID, appTheme, { includeDiffColors: true })
    }
  }, [appTheme])

  const selected = commits[selectedIndex]
  const previous = selectedIndex < commits.length - 1 ? commits[selectedIndex + 1] : null

  useEffect(() => {
    if (!selected) return
    setDiffLoading(true)

    const load = async (): Promise<void> => {
      const [modResult, origResult] = await Promise.all([
        window.api.getLocalFileAtCommit({ rootPath, filePath, commitHash: selected.hash }),
        previous
          ? window.api.getLocalFileAtCommit({ rootPath, filePath, commitHash: previous.hash })
          : Promise.resolve({ success: true, data: '' })
      ])
      setModified(modResult.success ? (modResult.data ?? '') : '')
      setOriginal(origResult.success ? (origResult.data ?? '') : '')
      setDiffLoading(false)
    }
    load()
  }, [selected, previous, rootPath, filePath])

  // Re-apply dim + scroll when diff finishes loading
  useEffect(() => {
    if (diffLoading || !diffEditorRef.current) return
    const timer = setTimeout(() => {
      if (diffEditorRef.current) applyDimAndScroll(diffEditorRef.current)
    }, 300)
    return () => clearTimeout(timer)
  }, [diffLoading, original, modified, applyDimAndScroll])

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <TimelineSlider
        commits={commits}
        selectedIndex={selectedIndex}
        onSelectIndex={onSelectIndex}
      />

      <CommitInfo commit={selected} previous={previous} />

      {diffLoading ? (
        <AppInlineLoader message="Loading diff…" size={16} className="flex-1" />
      ) : (
        <div className="flex-1 min-h-0">
          <DiffEditor
            height="100%"
            language={language}
            original={original}
            modified={modified}
            theme={CUSTOM_THEME_ID}
            onMount={handleEditorMount}
            options={{
              readOnly: true,
              renderSideBySide: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: editorFontSize,
              lineNumbers: 'on',
              folding: true,
              wordWrap: 'off',
              contextmenu: false,
              renderOverviewRuler: false,
              scrollbar: APP_MONACO_SCROLLBAR_OPTIONS
            }}
          />
        </div>
      )}
    </div>
  )
}

function TimelineSlider({
  commits,
  selectedIndex,
  onSelectIndex
}: {
  commits: FileHistoryEntry[]
  selectedIndex: number
  onSelectIndex: (i: number) => void
}): React.JSX.Element {
  const reversedIndex = commits.length - 1 - selectedIndex
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const activeEl = container.querySelector('[data-active="true"]')
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [selectedIndex])

  return (
    <div className="px-4 py-3 border-b border-border/40 bg-muted/20 shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">Oldest</span>
        <div className="flex-1 relative min-w-0">
          <Slider
            min={0}
            max={commits.length - 1}
            value={[reversedIndex]}
            onValueChange={(vals) => onSelectIndex(commits.length - 1 - (vals[0] ?? 0))}
          />
          <div ref={scrollRef} className="flex mt-2 gap-2 overflow-x-auto scrollbar-none">
            {commits
              .slice()
              .reverse()
              .map((commit, i) => {
                const realIndex = commits.length - 1 - i
                const isSelected = realIndex === selectedIndex
                return (
                  <button
                    key={commit.hash}
                    data-active={isSelected}
                    onClick={() => onSelectIndex(realIndex)}
                    className={`flex flex-col items-center shrink-0 cursor-pointer px-2 py-1 rounded transition-colors ${isSelected ? "bg-info/10" : "hover:bg-accent"}`}
                    style={{
                      minWidth: `${100 / Math.min(commits.length, 15)}%`,
                    }}
                    title={`${commit.authorName} — ${commit.message}`}
                  >
                    <div
                      className={`size-2 rounded-full transition-all ${isSelected ? "bg-info scale-125" : "bg-muted-foreground/40"}`}
                    />
                    <span
                      className={`text-[10px] mt-1 max-w-[90px] truncate leading-tight ${isSelected ? "text-info font-semibold" : "text-muted-foreground/70"}`}
                    >
                      {commit.authorName}
                    </span>
                    <span
                      className={`text-[9px] leading-tight ${isSelected ? "text-info/70" : "text-muted-foreground/40"}`}
                    >
                      {commit.hash.slice(0, 7)}
                    </span>
                    <span
                      className={`text-[9px] leading-tight ${isSelected ? "text-info/80" : "text-muted-foreground/50"}`}
                    >
                      {formatShortDate(commit.date)}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">Newest</span>
      </div>
    </div>
  )
}

function CommitInfo({
  commit,
  previous
}: {
  commit: FileHistoryEntry
  previous: FileHistoryEntry | null
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border/40 bg-muted/10 shrink-0 text-xs">
      <Tooltip content="Click to copy full hash" side="bottom">
        <button
          onClick={() => copyWithToast(commit.hash, "Commit hash")}
          className="inline-flex items-center gap-1.5 min-w-0 px-1.5 py-0.5 rounded hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer group"
        >
          <GitCommitHorizontal className="size-3.5 text-info shrink-0" />
          <span className="text-foreground">{commit.hash.slice(0, 7)}</span>
          <Copy className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
        </button>
      </Tooltip>

      <Tooltip content="Click to copy author name" side="bottom">
        <button
          onClick={() => copyWithToast(commit.authorName, "Author name")}
          className="inline-flex items-center gap-1 font-medium truncate px-1.5 py-0.5 rounded hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer group"
        >
          <span className="truncate text-foreground">{commit.authorName}</span>
          <Copy className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
        </button>
      </Tooltip>

      <Tooltip content="Click to copy date" side="bottom">
        <button
          onClick={() => copyWithToast(commit.date, "Date")}
          className="inline-flex items-center gap-1 text-muted-foreground shrink-0 px-1.5 py-0.5 rounded hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer group"
        >
          {formatFullDate(commit.date)}
          <Copy className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
        </button>
      </Tooltip>

      <Tooltip content="Click to copy commit message" side="bottom">
        <button
          onClick={() => copyWithToast(commit.message, "Commit message")}
          className="inline-flex items-center gap-1 truncate flex-1 text-left text-muted-foreground italic px-1.5 py-0.5 rounded hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer group"
        >
          <span className="truncate">{commit.message}</span>
          <Copy className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
        </button>
      </Tooltip>

      {previous && (
        <span className="text-muted-foreground shrink-0 px-1.5 py-0.5">
          vs {previous.hash.slice(0, 7)}
        </span>
      )}
    </div>
  );
}

function formatShortDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

function formatFullDate(iso: string): string {
  const d = new Date(iso)
  return (
    d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  )
}
