import { useCallback, useRef, useState } from 'react'
import * as ReactDOM from 'react-dom'

import { CommitHoverCardContent } from './CommitHoverCardContent'
import type { CommitHoverCardProps } from './CommitHoverCard.types'

export function CommitHoverCard({ commit, children }: CommitHoverCardProps): React.JSX.Element {
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
    cancelHide()
    if (showTimerRef.current) clearTimeout(showTimerRef.current)
    showTimerRef.current = setTimeout(() => {
      if (!triggerRef.current) return
      const rect = triggerRef.current.getBoundingClientRect()
      setPos({
        top: rect.top + rect.height / 2,
        left: rect.left - 8
      })
      setVisible(true)
    }, 400)
  }, [cancelHide])

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
        ReactDOM.createPortal(
          <div
            className="fixed z-[9999]"
            style={{
              top: pos.top,
              left: pos.left,
              transform: 'translate(-100%, -50%)'
            }}
            onMouseEnter={cancelHide}
            onMouseLeave={scheduleHide}
          >
            <CommitHoverCardContent commit={commit} />
          </div>,
          document.body
        )}
    </div>
  )
}
