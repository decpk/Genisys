import { useEffect, useRef } from 'react'

import type { EditableTextProps } from './EditableText.types'

const EDITABLE_STYLE: React.CSSProperties = {
  width: '100%',
  height: '100%',
  outline: 'none',
  cursor: 'text',
  userSelect: 'text',
}

/** Inline contentEditable surface for editing a text element on the canvas. */
export function EditableText(props: EditableTextProps): React.JSX.Element {
  const { initial, onCommit } = props
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    node.textContent = initial
    node.focus()
    const range = document.createRange()
    range.selectNodeContents(node)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  }, [initial])

  const commit = (): void => {
    onCommit(ref.current?.textContent ?? '')
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    e.stopPropagation()
    if (e.key === 'Escape' || (e.key === 'Enter' && !e.shiftKey)) {
      e.preventDefault()
      commit()
    }
  }

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      tabIndex={0}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      onPointerDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      style={EDITABLE_STYLE}
    />
  )
}
