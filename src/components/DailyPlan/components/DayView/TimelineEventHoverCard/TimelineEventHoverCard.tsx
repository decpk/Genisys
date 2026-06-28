import { useCallback, useRef, useState } from 'react'
import * as ReactDOM from 'react-dom'

import type { TimelineEventHoverCardProps } from './TimelineEventHoverCard.types'

export function TimelineEventHoverCard({ content, children, disabled }: TimelineEventHoverCardProps): React.JSX.Element {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelHide = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  const scheduleHide = useCallback(() => {
    cancelHide()
    hideTimerRef.current = setTimeout(() => {
      setVisible(false)
    }, 150)
  }, [cancelHide])

  const show = useCallback(() => {
    if (disabled) return
    cancelHide()
    if (showTimerRef.current) clearTimeout(showTimerRef.current)
    showTimerRef.current = setTimeout(() => {
      if (!triggerRef.current) return
      // The actual timeline block (TaskBlock/MeetingBlock) is `position: absolute`,
      // which collapses the wrapper to a zero-size box at the top of the timeline.
      // Anchor to the inner `[data-timeline-event]` element so the popover follows
      // the block's real on-screen position.
      const anchor =
        triggerRef.current.querySelector('[data-timeline-event]') ?? triggerRef.current
      const rect = anchor.getBoundingClientRect()
      setPos({
        top: rect.top + rect.height / 2,
        left: rect.left - 8,
      })
      setVisible(true)
    }, 400)
  }, [cancelHide, disabled])

  const hide = useCallback(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current)
      showTimerRef.current = null
    }
    scheduleHide()
  }, [scheduleHide])

  return (
    <div ref={triggerRef} onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible &&
        !disabled &&
        ReactDOM.createPortal(
          <div
            className="fixed z-[9999]"
            style={{
              top: pos.top,
              left: pos.left,
              transform: 'translate(-100%, -50%)',
            }}
            onMouseEnter={cancelHide}
            onMouseLeave={scheduleHide}
          >
            {content}
          </div>,
          document.body,
        )}
    </div>
  )
}
