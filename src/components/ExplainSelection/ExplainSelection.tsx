import { useRef, useState, useEffect, useCallback } from 'react'
import * as ReactDOM from 'react-dom'
import { BookOpen, Volume2 } from 'lucide-react'
import { useTextToSpeechContext } from '@/components/TextToSpeech'
import { ExplainPanel } from './ExplainPanel'

const MIN_SELECTION_LENGTH = 2
const PANEL_WIDTH = 420
const PANEL_MAX_HEIGHT = 480
const BASE_Z_INDEX = 9999

interface SelectionPosition {
  x: number
  y: number
}

interface PanelInstance {
  id: string
  text: string
  x: number
  y: number
  zIndex: number
}

export function ExplainSelection(): React.JSX.Element | null {
  const [contextMenuPos, setContextMenuPos] = useState<SelectionPosition | null>(null)
  const [contextMenuText, setContextMenuText] = useState('')
  const [panels, setPanels] = useState<PanelInstance[]>([])

  const tts = useTextToSpeechContext()
  const contextMenuRef = useRef<HTMLDivElement>(null)
  const zCounterRef = useRef(0)

  const nextZIndex = useCallback(() => {
    zCounterRef.current += 1
    return BASE_Z_INDEX + zCounterRef.current
  }, [])

  // Clamp position to viewport
  const clampToViewport = useCallback(
    (x: number, y: number, width: number, height: number): SelectionPosition => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      return {
        x: Math.max(8, Math.min(x, vw - width - 8)),
        y: Math.max(8, Math.min(y, vh - height - 8)),
      }
    },
    [],
  )

  const computePanelPos = useCallback(
    (triggerPos: SelectionPosition): SelectionPosition => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      let px = triggerPos.x - PANEL_WIDTH / 2
      let py = triggerPos.y + 8

      px = Math.max(8, Math.min(px, vw - PANEL_WIDTH - 8))

      if (py + PANEL_MAX_HEIGHT > vh) {
        py = triggerPos.y - PANEL_MAX_HEIGHT - 8
      }
      if (py < 8) {
        py = 8
      }
      return { x: px, y: py }
    },
    [],
  )

  const handleExplain = useCallback(
    (text: string, pos: SelectionPosition) => {
      const panelPos = computePanelPos(pos)
      const newPanel: PanelInstance = {
        id: crypto.randomUUID(),
        text,
        x: panelPos.x,
        y: panelPos.y,
        zIndex: nextZIndex(),
      }
      setPanels((prev) => [...prev, newPanel])
      setContextMenuPos(null)
    },
    [computePanelPos, nextZIndex],
  )

  const handlePanelClose = useCallback((id: string) => {
    setPanels((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const handlePanelFocus = useCallback(
    (id: string) => {
      setPanels((prev) => {
        const target = prev.find((p) => p.id === id)
        if (!target) return prev
        // Already on top
        const maxZ = Math.max(...prev.map((p) => p.zIndex))
        if (target.zIndex === maxZ) return prev
        const z = nextZIndex()
        return prev.map((p) => (p.id === id ? { ...p, zIndex: z } : p))
      })
    },
    [nextZIndex],
  )

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (
        contextMenuPos &&
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target as Node)
      ) {
        setContextMenuPos(null)
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      // Don't interfere inside any explain panel
      if ((e.target as Element)?.closest?.('[data-explain-panel]')) return

      const selection = window.getSelection()
      const text = selection?.toString().trim() ?? ''

      if (text.length >= MIN_SELECTION_LENGTH) {
        const range = selection!.getRangeAt(0)
        const ancestor = range.commonAncestorContainer instanceof Element
          ? range.commonAncestorContainer
          : range.commonAncestorContainer.parentElement
        if (ancestor?.closest('[data-selection-toolbar]')) return

        e.preventDefault()
        setContextMenuText(text)
        const pos = clampToViewport(e.clientX, e.clientY, 220, 40);
        setContextMenuPos(pos)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      // Only consume Escape when it actually dismisses something; otherwise let
      // it pass through normally. Consuming it also stops Escape from exiting
      // native fullscreen while a menu/panel is open.
      if (contextMenuPos) {
        e.preventDefault()
        setContextMenuPos(null)
      } else if (panels.length > 0) {
        e.preventDefault()
        // Close the topmost panel
        setPanels((prev) => {
          if (prev.length === 0) return prev
          const maxZ = Math.max(...prev.map((p) => p.zIndex))
          return prev.filter((p) => p.zIndex !== maxZ)
        })
      }
    }

    const handleTriggerExplain = (e: Event) => {
      const { text } = (e as CustomEvent).detail
      if (!text || text.length < MIN_SELECTION_LENGTH) return

      const selection = window.getSelection()
      let rect: DOMRect | null = null
      if (selection && selection.rangeCount > 0) {
        rect = selection.getRangeAt(0).getBoundingClientRect()
      }

      const x = rect?.left ?? window.innerWidth / 2
      const y = rect?.top ?? window.innerHeight / 3
      const pos = rect && rect.width > 0
        ? clampToViewport(x, y, 140, 40)
        : { x: window.innerWidth / 2, y: window.innerHeight / 3 }

      handleExplain(text, pos)
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('genisys:trigger-explain', handleTriggerExplain)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('genisys:trigger-explain', handleTriggerExplain)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextMenuPos, panels, clampToViewport, handleExplain])

  const contextMenu = contextMenuPos
    ? ReactDOM.createPortal(
        <div
          ref={contextMenuRef}
          className="fixed z-[9999] flex items-center gap-2 rounded-lg border-0 bg-primary p-1 shadow-lg animate-in fade-in-0 zoom-in-95 duration-150"
          style={{
            left: contextMenuPos.x,
            top: contextMenuPos.y,
          }}
        >
          <button
            onClick={() => handleExplain(contextMenuText, contextMenuPos)}
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <BookOpen size={14} />
            Explain
          </button>
          <div className="w-px self-stretch bg-primary-foreground/30" />
          <button
            onClick={() => {
              tts.speak(contextMenuText);
              setContextMenuPos(null);
            }}
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <Volume2 size={14} />
            Read Aloud
          </button>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      {contextMenu}
      {panels.map((panel) => (
        <ExplainPanel
          key={panel.id}
          id={panel.id}
          text={panel.text}
          initialX={panel.x}
          initialY={panel.y}
          zIndex={panel.zIndex}
          onClose={handlePanelClose}
          onFocus={handlePanelFocus}
        />
      ))}
    </>
  )
}
