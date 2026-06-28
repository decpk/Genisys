import { useEffect, useState, useCallback, useRef } from 'react'
import { Sparkles, Scissors, BookOpen } from 'lucide-react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('chat')

import { Button } from '@/components/ui/button'
import { useSnippetsStore } from '@/store/snippets-store'
import { useChatHistoryStore } from '@/store/chat-history-store'

interface Position {
  x: number
  y: number
}

interface SelectionToolbarProps {
  containerRef: React.RefObject<HTMLElement | null>
  onSummarize: (text: string) => void
}

export function SelectionToolbar({
  containerRef,
  onSummarize,
}: SelectionToolbarProps): React.JSX.Element | null {
  const [selectedText, setSelectedText] = useState('')
  const [position, setPosition] = useState<Position | null>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const addSnippet = useSnippetsStore((s) => s.addSnippet)

  const handleMouseUp = useCallback(() => {
    // Small delay so the selection is finalized
    requestAnimationFrame(() => {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed || !selection.rangeCount) {
        setPosition(null)
        setSelectedText('')
        return
      }

      const text = selection.toString().trim()
      if (!text) {
        setPosition(null)
        setSelectedText('')
        return
      }

      // Check the selection is inside our container
      const container = containerRef.current
      if (!container) return
      const range = selection.getRangeAt(0)
      if (!container.contains(range.commonAncestorContainer)) {
        setPosition(null)
        setSelectedText('')
        return
      }

      const rect = range.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()

      setSelectedText(text)
      setPosition({
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top - containerRect.top - 8,
      })
    })
  }, [containerRef])

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      // If clicking inside the toolbar, don't dismiss
      if (toolbarRef.current?.contains(e.target as Node)) return
      setPosition(null)
      setSelectedText('')
    },
    []
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      container.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [containerRef, handleMouseUp, handleMouseDown])

  const handleSummarize = useCallback(() => {
    if (!selectedText) return
    onSummarize(selectedText)
    setPosition(null)
    setSelectedText('')
    window.getSelection()?.removeAllRanges()
  }, [selectedText, onSummarize])

  const handleAddSnippet = useCallback(() => {
    if (!selectedText) return
    const title = selectedText.slice(0, 50) + (selectedText.length > 50 ? '…' : '')
    const conversationId = useChatHistoryStore.getState().activeConversationId
    addSnippet(title, selectedText, conversationId)
    toast.success('Snippet saved', { duration: 1500 })
    setPosition(null)
    setSelectedText('')
    window.getSelection()?.removeAllRanges()
  }, [selectedText, addSnippet])

  const handleExplain = useCallback(() => {
    if (!selectedText) return
    // Dispatch custom event so ExplainSelection picks it up
    window.dispatchEvent(
      new CustomEvent('genisys:trigger-explain', { detail: { text: selectedText } })
    )
    setPosition(null)
    setSelectedText('')
  }, [selectedText])

  if (!position || !selectedText) return null

  return (
    <div
      ref={toolbarRef}
      className="absolute z-50 flex items-center gap-0.5 bg-secondary border border-primary/30 rounded-lg shadow-xl px-1 py-0.5 -translate-x-1/2 -translate-y-full animate-in fade-in zoom-in-95 duration-100"
      style={{ left: position.x, top: position.y }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <Button variant="ghost" size="sm" onClick={handleSummarize}>
        <Sparkles size={12} />
        Summarize
      </Button>
      <div className="w-px h-4 bg-border" />
      <Button variant="ghost" size="sm" onClick={handleAddSnippet}>
        <Scissors size={12} />
        Snippet
      </Button>
      <div className="w-px h-4 bg-border" />
      <Button variant="default" size="sm" onClick={handleExplain}>
        <BookOpen size={12} />
        Explain
      </Button>
    </div>
  );
}
