import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable'
import { useEffect, useRef, useState } from 'react'

import { columnsForWidth, gridColsClass } from '../../resolveTileColSpans'
import type { DashboardGridProps } from './DashboardGrid.types'

export function DashboardGrid({
  sortableIds,
  onReorder,
  children
}: DashboardGridProps): React.JSX.Element {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const gridRef = useRef<HTMLDivElement>(null)
  const [cols, setCols] = useState(6)

  useEffect(() => {
    const el = gridRef.current
    if (!el || typeof ResizeObserver === 'undefined') return

    const update = (): void => {
      setCols(columnsForWidth(el.clientWidth))
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sortableIds.indexOf(String(active.id))
    const newIndex = sortableIds.indexOf(String(over.id))
    onReorder(arrayMove(sortableIds, oldIndex, newIndex))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
        <div ref={gridRef} className={`grid ${gridColsClass(cols)} gap-4`}>
          {children(cols)}
        </div>
      </SortableContext>
    </DndContext>
  )
}
