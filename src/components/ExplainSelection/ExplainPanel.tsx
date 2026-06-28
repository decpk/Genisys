import { useRef, useEffect, useCallback, useLayoutEffect, memo } from 'react'
import * as ReactDOM from 'react-dom'
import { BookOpen, X } from 'lucide-react'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { AppLoaderGlyph } from '@/components/AppLoader'
import { IconButton } from '@/components/ui/icon-button'
import { useExplainStream } from './useExplainStream'

const PANEL_WIDTH = 420
const PANEL_MAX_HEIGHT = 480
const PANEL_HEADER_HEIGHT = 48
const VIEWPORT_MARGIN = 8

interface ExplainPanelProps {
  id: string
  text: string
  initialX: number
  initialY: number
  zIndex: number
  onClose: (id: string) => void
  onFocus: (id: string) => void
}

export const ExplainPanel = memo(function ExplainPanel({
  id,
  text,
  initialX,
  initialY,
  zIndex,
  onClose,
  onFocus,
}: ExplainPanelProps) {
  const isDraggingRef = useRef(false)
  const { content, isStreaming, error, explain, cancel, flush } = useExplainStream({
    shouldDeferRender: () => isDraggingRef.current,
  })
  const panelRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef({ x: 0, y: 0 })

  const clampOffsetToViewport = useCallback(
    (x: number, y: number) => {
      const maxLeft = Math.max(VIEWPORT_MARGIN, window.innerWidth - PANEL_WIDTH - VIEWPORT_MARGIN)
      const maxTop = Math.max(VIEWPORT_MARGIN, window.innerHeight - PANEL_HEADER_HEIGHT - VIEWPORT_MARGIN)
      return {
        x: Math.max(VIEWPORT_MARGIN - initialX, Math.min(x, maxLeft - initialX)),
        y: Math.max(VIEWPORT_MARGIN - initialY, Math.min(y, maxTop - initialY)),
      }
    },
    [initialX, initialY],
  )

  // Start streaming on mount
  useEffect(() => {
    explain(text)
    return () => { cancel() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep the compositor transform stable across streaming re-renders.
  useLayoutEffect(() => {
    const el = panelRef.current
    if (!el) return
    el.style.transform = `translate3d(${offsetRef.current.x}px, ${offsetRef.current.y}px, 0)`
  })

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      const panel = panelRef.current
      if (!panel) return

      e.preventDefault()
      e.stopPropagation()

      onFocus(id)

      const startX = e.clientX
      const startY = e.clientY
      const startOffsetX = offsetRef.current.x
      const startOffsetY = offsetRef.current.y
      const previousBodyUserSelect = document.body.style.userSelect
      const previousRootUserSelect = document.documentElement.style.userSelect
      const selection = window.getSelection()

      isDraggingRef.current = true
      panel.style.willChange = 'transform'
      document.body.style.userSelect = 'none'
      document.documentElement.style.userSelect = 'none'
      selection?.removeAllRanges()

      const onMove = (event: Event) => {
        const ev = event as PointerEvent
        ev.preventDefault()
        const { x, y } = clampOffsetToViewport(
          startOffsetX + ev.clientX - startX,
          startOffsetY + ev.clientY - startY,
        )

        offsetRef.current = { x, y }
        panel.style.transform = `translate3d(${x}px, ${y}px, 0)`
      }

      const onUp = (ev: PointerEvent) => {
        const { x, y } = clampOffsetToViewport(
          startOffsetX + ev.clientX - startX,
          startOffsetY + ev.clientY - startY,
        )

        offsetRef.current = { x, y }
        panel.style.transform = `translate3d(${x}px, ${y}px, 0)`
        panel.style.willChange = ''
        document.body.style.userSelect = previousBodyUserSelect
        document.documentElement.style.userSelect = previousRootUserSelect
        isDraggingRef.current = false
        window.getSelection()?.removeAllRanges()
        flush()

        window.removeEventListener(moveEventName, onMove)
        window.removeEventListener('pointerup', onUp)
        window.removeEventListener('pointercancel', onUp)
      }

      const moveEventName = 'onpointerrawupdate' in window ? 'pointerrawupdate' : 'pointermove'
      const listenerOptions = { passive: false }
      window.addEventListener(moveEventName, onMove, listenerOptions)
      window.addEventListener('pointerup', onUp)
      window.addEventListener('pointercancel', onUp)
    },
    [clampOffsetToViewport, flush, id, onFocus],
  )

  useEffect(() => {
    const handleResize = () => {
      const panel = panelRef.current
      if (!panel) return
      const { x, y } = clampOffsetToViewport(offsetRef.current.x, offsetRef.current.y)
      offsetRef.current = { x, y }
      panel.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [clampOffsetToViewport])

  const handleClose = useCallback(() => {
    cancel()
    onClose(id)
  }, [cancel, id, onClose])

  const handlePanelMouseDown = useCallback(() => {
    onFocus(id)
  }, [id, onFocus])

  return ReactDOM.createPortal(
    <div
      data-explain-panel
      ref={panelRef}
      onMouseDown={handlePanelMouseDown}
      className="fixed flex flex-col overflow-hidden rounded-xl border border-border/80 bg-popover/80 shadow-2xl backdrop-blur-xl"
      style={{
        left: initialX,
        top: initialY,
        width: PANEL_WIDTH,
        maxHeight: PANEL_MAX_HEIGHT,
        zIndex,
        contain: 'layout paint style',
        transform: 'translate3d(0, 0, 0)',
      }}
    >
      {/* Header — drag handle */}
      <div
        onPointerDown={handlePointerDown}
        className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/50 cursor-grab active:cursor-grabbing select-none"
        style={{ touchAction: 'none' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen size={15} className="text-primary shrink-0" />
          <span className="text-sm font-semibold text-foreground truncate">
            {text.length > 50 ? text.slice(0, 50) + '…' : text}
          </span>
        </div>
        <IconButton
          onClick={handleClose}
          onPointerDown={(e) => e.stopPropagation()}
          variant="default"
          size="sm"
          tooltip="Close"
          className="shrink-0 hover:bg-secondary/80"
        >
          <X size={14} />
        </IconButton>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 text-sm">
        {error ? (
          <div className="text-destructive text-sm">{error}</div>
        ) : content ? (
          <MarkdownRenderer
            content={content}
            isStreaming={isStreaming}
            enableCitations
            className="select-text [overflow-wrap:anywhere] prose-sm"
          />
        ) : isStreaming ? (
          <div className="flex items-center justify-center py-6">
            <AppLoaderGlyph size={24} />
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
})
