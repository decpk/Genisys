import { cn } from '@/lib/utils'
import type { ResizeHandle } from '@/lib/webpoint/resizeElementGeometry'

import { EditableText } from './components/EditableText'
import type { EditableElementProps } from './EditableElement.types'
import { useEditableElementData } from './useEditableElementData'

const HANDLES: ResizeHandle[] = ['nw', 'ne', 'sw', 'se']

const HANDLE_CLASS: Record<ResizeHandle, string> = {
  nw: '-left-1 -top-1 cursor-nwse-resize',
  ne: '-right-1 -top-1 cursor-nesw-resize',
  sw: '-left-1 -bottom-1 cursor-nesw-resize',
  se: '-right-1 -bottom-1 cursor-nwse-resize',
}

export function EditableElement(props: EditableElementProps): React.JSX.Element {
  const { element, isSelected } = props
  const {
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
  } = useEditableElementData(props)

  let body: React.ReactNode = null
  if (element.type === 'image') {
    body = (
      <img
        src={element.src}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: element.style.objectFit ?? 'cover',
          display: 'block',
        }}
      />
    )
  } else if (element.type === 'text' && editing) {
    body = <EditableText initial={element.content} onCommit={commitEditing} />
  } else if (element.type === 'text') {
    body = element.content
  }

  return (
    <div
      ref={elementRef}
      style={wrapperStyle}
      onPointerDown={onBodyPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDoubleClick={beginEditing}
      className={cn(isSelected && 'cursor-move', !isSelected && 'cursor-pointer')}
    >
      <div style={innerStyle} className={cn(isSelected && 'outline outline-2 outline-primary')}>
        {body}
      </div>
      {isSelected &&
        !editing &&
        HANDLES.map((handle) => (
          <span
            key={handle}
            onPointerDown={onResizePointerDown(handle)}
            className={cn(
              'absolute z-10 size-2 rounded-full border border-white bg-primary',
              HANDLE_CLASS[handle]
            )}
          />
        ))}
    </div>
  )
}
