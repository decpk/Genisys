import { memo } from 'react'
import { BookOpen, GripVertical } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import { EmptyState } from '@/components/ui/empty-state'

import { TileResizeMenu } from '../TileResizeMenu'
import { TileHeading } from '../TileHeading'
import { BookProgressCard } from './components/BookProgressCard'
import { useCurrentlyReadingTileData } from './hooks/useCurrentlyReadingTileData'
import type { CurrentlyReadingTileProps } from './CurrentlyReadingTile.types'

export const CurrentlyReadingTile = memo(function CurrentlyReadingTile(
  props: CurrentlyReadingTileProps
): React.JSX.Element {
  const { tileWidth, onWidthChange, dragHandleProps } = props
  const { recents, actions } = useCurrentlyReadingTileData()
  const { books, isLoaded } = recents

  const showEmpty = isLoaded && books.length === 0

  return (
    <div className="@container group relative border border-border rounded-lg bg-card overflow-hidden h-[400px] flex flex-col">
      {/* Action buttons — top-right, shown on hover */}
      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <TileResizeMenu tileWidth={tileWidth} onWidthChange={onWidthChange} />
        <IconButton
          tooltip="Drag to reorder"
          tooltipSide="bottom"
          size="xs"
          className="cursor-grab active:cursor-grabbing"
          {...dragHandleProps.attributes}
          {...dragHandleProps.listeners}
        >
          <GripVertical size={14} />
        </IconButton>
      </div>

      {/* Header */}
      <TileHeading
        icon={BookOpen}
        title="Currently Reading"
        appId="library"
        appLabel="Open Library"
        count={books.length > 0 ? books.length : undefined}
      />

      {/* Content */}
      {showEmpty ? (
        <div className="p-4 flex-1 flex items-center justify-center">
          <EmptyState
            message="No books yet. Add one in Library to see it here."
            icon={BookOpen}
            className="py-6"
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {books.map((book) => (
            <BookProgressCard key={book.id} book={book} onResume={actions.resume} />
          ))}
        </div>
      )}
    </div>
  )
})
