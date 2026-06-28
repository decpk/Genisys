import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { TILE_WIDTH_COLS } from '../../Dashboard.types'
import type { SortableTileProps } from './SortableTile.types'

export function SortableTile({ id, tileWidth, colSpanClass, children }: SortableTileProps): React.JSX.Element {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div ref={setNodeRef} style={style} className={`relative ${colSpanClass ?? TILE_WIDTH_COLS[tileWidth]}`}>
      {children({ attributes, listeners })}
    </div>
  )
}
