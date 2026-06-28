import { useState, useEffect, memo, useCallback } from 'react'
import { FileCode, Copy, Check, ArrowLeft } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import { useChatHistoryStore } from '@/store/chat-history-store'

import { SourceManager } from './SourceManager'

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

export function SourcePanel(): React.JSX.Element {
  const citation = useChatHistoryStore((s) => s.activeCitation)
  const activeConversationId = useChatHistoryStore((s) => s.activeConversationId)

  if (citation) return <CitationViewer />

  return <SourceManager disabled={!activeConversationId} />
}

// ─── Citation viewer ─────────────────────────────────────────────

function CitationViewer(): React.JSX.Element {
  const citation = useChatHistoryStore((s) => s.activeCitation)
  const setActiveCitation = useChatHistoryStore((s) => s.setActiveCitation)
  const activeSources = useChatHistoryStore((s) => s.activeSources)

  const [content, setContent] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!citation) {
      setContent(null)
      setImageUrl(null)
      return
    }

    let cancelled = false
    setImageUrl(null)
    setLoading(true)
    setError(null)

    const isImage = isImagePath(citation.filePath)

    const loadFile = async (): Promise<void> => {
      try {
        const rawSource = activeSources.find(
          (s) => s.sourceType === 'raw' && s.name === citation.filePath,
        )
        if (rawSource) {
          if (!cancelled) setContent(rawSource.path)
          return
        }

        const repoSource = activeSources.find(
          (s) => s.sourceType === 'repo' && s.path && citation.filePath.startsWith(s.name),
        )
        if (repoSource && repoSource.path) {
          const relativePath = citation.filePath.replace(repoSource.name + '/', '')
          if (isImage) {
            const { dataUrl, error: imgErr } = await loadImageDataUrl(`${repoSource.path}/${relativePath}`)
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

        if (isImage) {
          const { dataUrl, error: imgErr } = await loadImageDataUrl(citation.filePath)
          if (!cancelled) {
            if (dataUrl) setImageUrl(dataUrl)
            else setError(imgErr ?? 'Failed to load image')
          }
          return
        }

        const result = (await window.api.readTextFile(citation.filePath)) as {
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
  }, [citation, activeSources])

  const handleBack = useCallback(() => setActiveCitation(null), [setActiveCitation])

  const handleCopy = useCallback(() => {
    if (!content) return
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [content])

  if (!citation) return <div />

  const fileName = citation.filePath.split('/').pop() ?? citation.filePath
  const lineInfo = citation.startLine
    ? citation.endLine
      ? `Lines ${citation.startLine}–${citation.endLine}`
      : `Line ${citation.startLine}`
    : null

  const displayContent = content
    ? getHighlightedContent(content, citation.startLine, citation.endLine)
    : null

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-2 px-3 h-9">
        <IconButton variant="ghost" size="xs" tooltip="Back to sources" onClick={handleBack}>
          <ArrowLeft size={13} />
        </IconButton>
        <FileCode size={13} className="text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-[12px] font-semibold text-foreground truncate block">{fileName}</span>
          {lineInfo && (
            <span className="text-[10px] text-muted-foreground">{lineInfo}</span>
          )}
        </div>
        <IconButton variant="ghost" size="xs" tooltip="Copy" onClick={handleCopy} disabled={!content}>
          {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
        </IconButton>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
            Loading…
          </div>
        )}
        {error && (
          <div className="p-4 text-xs text-destructive">{error}</div>
        )}
        {imageUrl && (
          <div className="flex items-center justify-center p-4">
            <img
              src={imageUrl}
              alt={fileName}
              className="max-w-full object-contain rounded-md"
            />
          </div>
        )}
        {displayContent && (
          <SourceCodeView
            lines={displayContent.lines}
            startLineNumber={displayContent.startLineNumber}
            highlightStart={citation.startLine}
            highlightEnd={citation.endLine}
          />
        )}
      </div>
    </div>
  )
}

function getHighlightedContent(
  content: string,
  startLine?: number,
  endLine?: number,
): { lines: string[]; startLineNumber: number } {
  const allLines = content.split('\n')

  if (!startLine) {
    return { lines: allLines, startLineNumber: 1 }
  }

  const contextBefore = 5
  const contextAfter = 5
  const start = Math.max(0, startLine - 1 - contextBefore)
  const end = Math.min(allLines.length, (endLine ?? startLine) + contextAfter)

  return {
    lines: allLines.slice(start, end),
    startLineNumber: start + 1,
  }
}

const SourceCodeView = memo(function SourceCodeView({
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
    <pre className="text-xs leading-6 p-0 m-0">
      {lines.map((line, i) => {
        const lineNum = startLineNumber + i;
        const isHighlighted =
          highlightStart !== undefined &&
          lineNum >= highlightStart &&
          lineNum <= (highlightEnd ?? highlightStart);

        return (
          <div
            key={lineNum}
            className={`flex px-2 ${isHighlighted ? "bg-primary/15 border-l-2 border-primary" : "border-l-2 border-transparent"}`}
          >
            <span className="shrink-0 w-10 text-right pr-3 text-muted-foreground/40 select-none">
              {lineNum}
            </span>
            <span className="flex-1 whitespace-pre overflow-x-auto">
              {line || " "}
            </span>
          </div>
        );
      })}
    </pre>
  );
})
