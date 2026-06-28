import { useCallback, useRef, useState } from 'react'

import type { NotesSplitDividerProps } from './NotesSplitDivider.types'

export function useNotesSplitDividerData(props: NotesSplitDividerProps) {
  const { orientation, containerRef, onRatioChange, onReset } = props

  const isDraggingRef = useRef<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    isDraggingRef.current = true
    setIsDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current) return

      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      let ratio: number
      if (orientation === 'side-by-side') {
        if (rect.width === 0) return
        ratio = (e.clientX - rect.left) / rect.width
      } else {
        if (rect.height === 0) return
        ratio = (e.clientY - rect.top) / rect.height
      }

      const clamped = Math.min(1, Math.max(0, ratio))
      onRatioChange(clamped)
    },
    [orientation, containerRef, onRatioChange],
  )

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false
    setIsDragging(false)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        // ignore: pointer may already be released
      }
    }
  }, [])

  const onDoubleClick = useCallback(() => {
    onReset?.()
  }, [onReset])

  return { isDragging, onPointerDown, onPointerMove, onPointerUp, onDoubleClick }
}
