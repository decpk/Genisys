import { useRef, useState } from 'react'

import { buildElementStyles } from '@/lib/webpoint/buildElementStyles'
import { resizeElementGeometry, type ResizeHandle } from '@/lib/webpoint/resizeElementGeometry'
import type { SlideElement } from '@/store/webpoint-store/types'

import type { EditableElementProps } from './EditableElement.types'

interface Geometry {
  x: number
  y: number
  w: number
  h: number
}

interface DragState {
  mode: 'move' | ResizeHandle
  startX: number
  startY: number
  start: Geometry
  rectW: number
  rectH: number
}

export function useEditableElementData(props: EditableElementProps) {
  const { element, canvasRef, onSelect, onChange } = props
  const [live, setLive] = useState<Geometry | null>(null)
  const [editing, setEditing] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)

  const geometry: Geometry = live ?? { x: element.x, y: element.y, w: element.w, h: element.h }

  const wrapperStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${geometry.x}%`,
    top: `${geometry.y}%`,
    width: `${geometry.w}%`,
    height: `${geometry.h}%`,
    zIndex: element.zIndex,
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
  }

  const base = buildElementStyles(element, 'cqw', false) as unknown as React.CSSProperties
  const innerStyle: React.CSSProperties = {
    ...base,
    position: 'relative',
    left: undefined,
    top: undefined,
    width: '100%',
    height: '100%',
    transform: undefined,
  }

  const begin = (mode: 'move' | ResizeHandle, e: React.PointerEvent): void => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    e.preventDefault()
    e.stopPropagation()
    elementRef.current?.setPointerCapture(e.pointerId)
    dragRef.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      start: { x: element.x, y: element.y, w: element.w, h: element.h },
      rectW: rect.width,
      rectH: rect.height,
    }
  }

  const onBodyPointerDown = (e: React.PointerEvent): void => {
    if (editing) return
    onSelect(element.id)
    begin('move', e)
  }

  const onResizePointerDown = (handle: ResizeHandle) => (e: React.PointerEvent): void => {
    onSelect(element.id)
    begin(handle, e)
  }

  const onPointerMove = (e: React.PointerEvent): void => {
    const drag = dragRef.current
    if (!drag) return
    const dx = ((e.clientX - drag.startX) / drag.rectW) * 100
    const dy = ((e.clientY - drag.startY) / drag.rectH) * 100
    if (drag.mode === 'move') {
      const x = Math.max(0, Math.min(drag.start.x + dx, 100 - drag.start.w))
      const y = Math.max(0, Math.min(drag.start.y + dy, 100 - drag.start.h))
      setLive({ ...drag.start, x, y })
    } else {
      setLive(resizeElementGeometry(drag.mode, drag.start, dx, dy))
    }
  }

  const onPointerUp = (): void => {
    if (!dragRef.current) return
    dragRef.current = null
    setLive((current) => {
      if (current) onChange({ ...element, ...current } as SlideElement)
      return null
    })
  }

  const beginEditing = (): void => {
    if (element.type === 'text') setEditing(true)
  }
  const commitEditing = (content: string): void => {
    setEditing(false)
    if (element.type === 'text' && content !== element.content) {
      onChange({ ...element, content })
    }
  }

  return {
    elementRef,
    wrapperStyle,
    innerStyle,
    editing,
    onBodyPointerDown,
    onResizePointerDown,
    onPointerMove,
    onPointerUp,
    beginEditing,
    commitEditing,
  }
}
