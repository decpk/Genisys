import { useState, useEffect, useCallback, memo } from 'react'
import { X, Copy, Check, FileCode, FolderOpen, FileText, File, GitBranch, Hash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { useChatHistoryStore } from '@/store/chat-history-store'

const SOURCE_TYPE_ICON = {
  file: File,
  repo: FolderOpen,
  raw: FileText,
} as const

const IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'bmp'])

function isImagePath(path: string): boolean {
  const dot = path.lastIndexOf('.')
  if (dot === -1) return false
  return IMAGE_EXTS.has(path.slice(dot + 1).toLowerCase())
}

async function loadImageDataUrl(absPath: string): Promise<{ dataUrl?: string; error?: string }> {
  const result = await window.api.codeReadFileAsDataUrl(absPath)
  if (result.success && result.data) return { dataUrl: result.data.dataUrl }
  return { error: result.error ?? 'Failed to load image' }
}

export function SourcePreviewModal(): React.JSX.Element | null {
  const preview = useChatHistoryStore((s) => s.sourcePreview)
  const close = useChatHistoryStore((s) => s.closeSourcePreview)
  const activeSources = useChatHistoryStore((s) => s.activeSources)

  const [content, setContent] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!preview) {
      setContent(null)
      setImageUrl(null)
      setError(null)
      return
    }

    setImageUrl(null)

    if (preview.sourceType === 'repo') {
      setContent(null)
      setLoading(false)
      return
    }

    if (preview.content) {
      setContent(preview.content)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    const isImage = isImagePath(preview.filePath)

    const loadFile = async (): Promise<void> => {
      try {
        const rawSource = activeSources.find(
          (s) => s.sourceType === 'raw' && s.name === preview.filePath,
        )
        if (rawSource) {
          if (!cancelled) setContent(rawSource.path)
          return
        }

        const fileSource = activeSources.find(
          (s) => s.sourceType === 'file' && s.path && (
            s.path === preview.filePath ||
            s.name === preview.filePath ||
            s.path.endsWith('/' + preview.filePath)
          ),
        )
        if (fileSource && fileSource.path) {
          if (isImage) {
            const { dataUrl, error: imgErr } = await loadImageDataUrl(fileSource.path)
            if (!cancelled) {
              if (dataUrl) setImageUrl(dataUrl)
              else setError(imgErr ?? 'Failed to load image')
            }
            return
          }
          const result = (await window.api.readTextFile(fileSource.path)) as {
            success: boolean; data?: string; error?: string
          }
          if (!cancelled) {
            if (result.success && result.data) setContent(result.data)
            else setError(result.error ?? 'Failed to load file')
          }
          return
        }

        const repoSource = activeSources.find(
          (s) => s.sourceType === 'repo' && s.path && (
            preview.filePath.startsWith(s.name + '/') ||
            preview.filePath.startsWith(s.path + '/')
          ),
        )
        if (repoSource && repoSource.path) {
          const relativePath = preview.filePath
            .replace(repoSource.name + '/', '')
            .replace(repoSource.path + '/', '')
          if (isImage) {
            const absPath = `${repoSource.path}/${relativePath}`
            const { dataUrl, error: imgErr } = await loadImageDataUrl(absPath)
            if (!cancelled) {
              if (dataUrl) setImageUrl(dataUrl)
              else setError(imgErr ?? 'Failed to load image')
            }
            return
          }
          const result = (await window.api.getLocalFileContent({
            rootPath: repoSource.path,
            filePath: relativePath,
          })) as { success: boolean; data?: string; error?: string }
          if (!cancelled) {
            if (result.success && result.data) setContent(result.data)
            else setError(result.error ?? 'Failed to load file')
          }
          return
        }

        const repoForFile = activeSources.find((s) => s.sourceType === 'repo' && s.path)
        if (repoForFile && repoForFile.path) {
          if (isImage) {
            const absPath = `${repoForFile.path}/${preview.filePath}`
            const { dataUrl } = await loadImageDataUrl(absPath)
            if (!cancelled && dataUrl) {
              setImageUrl(dataUrl)
              return
            }
          } else {
            const result = (await window.api.getLocalFileContent({
              rootPath: repoForFile.path,
              filePath: preview.filePath,
            })) as { success: boolean; data?: string; error?: string }
            if (!cancelled && result.success && result.data) {
              setContent(result.data)
              return
            }
          }
        }

        if (isImage) {
          const { dataUrl, error: imgErr } = await loadImageDataUrl(preview.filePath)
          if (!cancelled) {
            if (dataUrl) setImageUrl(dataUrl)
            else setError(imgErr ?? 'Failed to load image')
          }
          return
        }

        const result = (await window.api.readTextFile(preview.filePath)) as {
          success: boolean
          data?: string
          error?: string
        }
        if (!cancelled) {
          if (result.success && result.data) setContent(result.data)
          else setError(result.error ?? 'Failed to load file')
        }
      } catch (e) {
        if (!cancelled) setError(String(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadFile()
    return () => { cancelled = true }
  }, [preview, activeSources])

  useEffect(() => {
    if (!preview) return
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        // Consume Escape so it can't fall through to the WebView/native
        // default (which would also exit macOS fullscreen).
        e.preventDefault()
        close()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [preview, close])

  const handleCopy = useCallback(() => {
    if (!content) return
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [content])

  if (!preview) return null

  const fileName = preview.name || preview.filePath.split('/').pop() || preview.filePath
  const Icon = SOURCE_TYPE_ICON[preview.sourceType] ?? FileCode
  const lineInfo = preview.startLine
    ? preview.endLine
      ? `Lines ${preview.startLine}–${preview.endLine}`
      : `Line ${preview.startLine}`
    : null

  const displayLines = content
    ? getDisplayLines(content, preview.startLine, preview.endLine)
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />

      <div className="relative w-[90vw] max-w-4xl h-[80vh] flex flex-col rounded-2xl border border-border/60 bg-background shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="shrink-0 flex items-center gap-3 px-5 py-3.5 border-b border-border/60 bg-card/80">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <Icon size={15} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">{fileName}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              {lineInfo && (
                <span className="text-[11px] text-primary font-medium">{lineInfo}</span>
              )}
              <span className="text-[11px] text-muted-foreground/60 truncate" title={preview.filePath}>
                {preview.filePath}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={!content}
            className="shrink-0"
          >
            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <IconButton variant="ghost" size="md" tooltip="Close" onClick={close}>
            <X size={16} />
          </IconButton>
        </div>

        <div className="flex-1 overflow-auto bg-muted/20">
          {preview.sourceType === 'repo' ? (
            <RepoInfoView name={preview.name} path={preview.filePath} />
          ) : (
            <>
              {loading && (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  Loading file…
                </div>
              )}
              {error && (
                <div className="flex items-center justify-center h-full p-6">
                  <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-5 py-3">{error}</p>
                </div>
              )}
              {imageUrl && (
                <div className="flex items-center justify-center h-full p-4">
                  <img
                    src={imageUrl}
                    alt={fileName}
                    className="max-w-full max-h-full object-contain rounded-md"
                  />
                </div>
              )}
              {displayLines && (
                <CodeView
                  lines={displayLines.lines}
                  startLineNumber={displayLines.startLineNumber}
                  highlightStart={preview.startLine}
                  highlightEnd={preview.endLine}
                />
              )}
              {!loading && !error && !displayLines && !imageUrl && content === '' && (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  File is empty
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function getDisplayLines(
  content: string,
  startLine?: number,
  endLine?: number,
): { lines: string[]; startLineNumber: number } {
  const allLines = content.split('\n')

  if (!startLine) {
    return { lines: allLines, startLineNumber: 1 }
  }

  const contextBefore = 10
  const contextAfter = 10
  const start = Math.max(0, startLine - 1 - contextBefore)
  const end = Math.min(allLines.length, (endLine ?? startLine) + contextAfter)

  return {
    lines: allLines.slice(start, end),
    startLineNumber: start + 1,
  }
}

const CodeView = memo(function CodeView({
  lines,
  startLineNumber,
  highlightStart,
  highlightEnd,
}: {
  lines: string[]
  startLineNumber: number
  highlightStart?: number
  highlightEnd?: number
}): React.JSX.Element {
  return (
    <pre className="text-[13px] leading-7 p-0 m-0">
      {lines.map((line, i) => {
        const lineNum = startLineNumber + i;
        const isHighlighted =
          highlightStart !== undefined &&
          lineNum >= highlightStart &&
          lineNum <= (highlightEnd ?? highlightStart);

        return (
          <div
            key={lineNum}
            className={`flex ${
              isHighlighted
                ? "bg-primary/12 border-l-[3px] border-primary"
                : "border-l-[3px] border-transparent"
            } hover:bg-muted/40 transition-colors`}
          >
            <span className="shrink-0 w-14 text-right pr-4 text-muted-foreground/35 select-none tabular-nums">
              {lineNum}
            </span>
            <span className="flex-1 whitespace-pre overflow-x-auto pr-4">
              {line || " "}
            </span>
          </div>
        );
      })}
    </pre>
  );
})

function RepoInfoView({ name, path }: { name: string; path: string }): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
        <FolderOpen size={28} className="text-amber-500" />
      </div>
      <div className="text-center space-y-1.5">
        <h3 className="text-base font-semibold text-foreground">{name}</h3>
        <p className="text-[12px] text-muted-foreground/70 max-w-md truncate">
          {path}
        </p>
      </div>
      <div className="flex items-center gap-3 mt-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 text-[11px] text-muted-foreground">
          <GitBranch size={12} />
          Repository source
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 text-[11px] text-muted-foreground">
          <Hash size={12} />
          Used for AI context
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground/50 max-w-sm text-center">
        This repository is attached as a source. The AI reads its files to
        answer your questions with relevant code context.
      </p>
    </div>
  );
}
