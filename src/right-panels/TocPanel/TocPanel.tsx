import { Sparkles } from 'lucide-react'

import { useTocPanelData } from './useTocPanelData'
import { headerStyles } from './TocPanel.styles'
import { TocEmptyState } from './TocEmptyState'
import { TocItem } from './TocItem'

export function TocPanel(): React.JSX.Element {
  const {
    items,
    activeItemId,
    scrollContainerRef,
    activeItemRef,
    onNavigate,
  } = useTocPanelData()

  if (items.length === 0) {
    return <TocEmptyState />
  }

  return (
    <div className="flex flex-col h-full">
      <div className={headerStyles}>
        <Sparkles size={12} className="text-primary/60" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          On this page
        </span>
        <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
          {items.length}
        </span>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto py-1.5 px-1.5">
        <div className="flex flex-col">
          {items.map((item, index) => {
            const isActive = activeItemId === item.id
            const showSeparator = item.level === 'primary' && index > 0

            return (
              <TocItem
                key={item.id}
                item={item}
                isActive={isActive}
                showSeparator={showSeparator}
                activeItemRef={isActive ? activeItemRef : undefined}
                onNavigate={onNavigate}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
