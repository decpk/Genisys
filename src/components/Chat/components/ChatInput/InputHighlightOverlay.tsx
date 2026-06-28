import { useEffect, useRef } from 'react'

import type { ChatCommand } from '@/store/command-store'
import { parseCommandTokens } from '../../utils/parseCommands'

interface InputHighlightOverlayProps {
  text: string
  commands: ChatCommand[]
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
}

export function InputHighlightOverlay({
  text,
  commands,
  textareaRef,
}: InputHighlightOverlayProps): React.JSX.Element {
  const overlayRef = useRef<HTMLDivElement>(null)

  // Sync scroll position with textarea
  useEffect(() => {
    const textarea = textareaRef.current
    const overlay = overlayRef.current
    if (!textarea || !overlay) return

    const handleScroll = (): void => {
      overlay.scrollTop = textarea.scrollTop
      overlay.scrollLeft = textarea.scrollLeft
    }
    textarea.addEventListener('scroll', handleScroll)
    return () => textarea.removeEventListener('scroll', handleScroll)
  }, [textareaRef])

  const segments = parseCommandTokens(text, commands)

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 pointer-events-none overflow-hidden px-2 py-1.5 text-sm leading-[1.75rem] whitespace-pre-wrap break-words"
      aria-hidden="true"
    >
      {segments.map((seg, i) =>
        seg.type === "command" ? (
          <span
            key={i}
            className="bg-primary/15 text-primary rounded px-0.5 font-medium"
          >
            {seg.value}
          </span>
        ) : (
          <span key={i} className="text-transparent">
            {seg.value}
          </span>
        ),
      )}
    </div>
  );
}
