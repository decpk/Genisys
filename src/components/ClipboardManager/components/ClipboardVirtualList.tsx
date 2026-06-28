import { useRef, useEffect, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useClipboardStore } from '@/store/clipboard-store'
import { ClipboardItemCard } from './ClipboardItemCard'
import { AppLoaderGlyph } from '@/components/AppLoader'
import { getFilteredItems } from '../utils/getFilteredItems'

export function ClipboardVirtualList(): React.JSX.Element {
  const parentRef = useRef<HTMLDivElement>(null)
  const allItems = useClipboardStore((s) => s.items)
  const filter = useClipboardStore((s) => s.filter)
  const hasMore = useClipboardStore((s) => s.hasMore)
  const isLoading = useClipboardStore((s) => s.isLoading)
  const loadItems = useClipboardStore((s) => s.loadItems)

  const items = useMemo(() => {
    return getFilteredItems(allItems, filter)
  }, [allItems, filter])

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => items[index]?.contentType === 'image' ? 200 : 80,
    getItemKey: (index) => items[index]?.id ?? index,
    overscan: 5,
  })

  // Infinite scroll: load more when near bottom
  const virtualItems = virtualizer.getVirtualItems()
  const lastItem = virtualItems[virtualItems.length - 1]

  useEffect(() => {
    if (!lastItem) return
    if (lastItem.index >= items.length - 10 && hasMore && !isLoading) {
      loadItems()
    }
  }, [lastItem?.index, items.length, hasMore, isLoading, loadItems])

  return (
    <div ref={parentRef} className="flex-1 overflow-auto">
      <div
        className="relative w-full"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index]
          if (!item) return null
          return (
            <div
              key={item.id}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              className="absolute top-0 left-0 w-full"
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              <ClipboardItemCard item={item} />
            </div>
          )
        })}
      </div>
      {isLoading && (
        <div className="flex justify-center py-4">
          <AppLoaderGlyph />
        </div>
      )}
    </div>
  )
}
