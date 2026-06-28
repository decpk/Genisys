import { GitCommitHorizontal, Circle } from 'lucide-react'

interface TimelineBaseItem {
  iterationId: number
  createdDate: string
  authorName: string
}

interface TimelineProps<T extends TimelineBaseItem> {
  snapshots: T[]
  selectedIndex: number
  onSelect: (index: number) => void
  renderIcon: (snapshot: T, isSelected: boolean) => React.ReactNode
  renderBadge?: (snapshot: T, isSelected: boolean) => React.ReactNode
  renderExtra?: (snapshot: T, isSelected: boolean) => React.ReactNode
  hasHighlight: (snapshot: T) => boolean
}

export function Timeline<T extends TimelineBaseItem>({
  snapshots,
  selectedIndex,
  onSelect,
  renderIcon,
  renderBadge,
  renderExtra,
  hasHighlight,
}: TimelineProps<T>) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border/40 shrink-0">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <GitCommitHorizontal size={16} className="text-info" />
          Iterations
        </h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {snapshots.length} iteration{snapshots.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {snapshots.map((snapshot, index) => (
          <TimelineItem
            key={snapshot.iterationId}
            snapshot={snapshot}
            index={index}
            isSelected={index === selectedIndex}
            isFirst={index === 0}
            isLast={index === snapshots.length - 1}
            onSelect={() => onSelect(index)}
            renderIcon={renderIcon}
            renderBadge={renderBadge}
            renderExtra={renderExtra}
            highlighted={hasHighlight(snapshot)}
          />
        ))}
      </div>
    </div>
  )
}

function TimelineItem<T extends TimelineBaseItem>({
  snapshot,
  index,
  isSelected,
  isFirst,
  isLast,
  onSelect,
  renderIcon,
  renderBadge,
  renderExtra,
  highlighted,
}: {
  snapshot: T
  index: number
  isSelected: boolean
  isFirst: boolean
  isLast: boolean
  onSelect: () => void
  renderIcon: (snapshot: T, isSelected: boolean) => React.ReactNode
  renderBadge?: (snapshot: T, isSelected: boolean) => React.ReactNode
  renderExtra?: (snapshot: T, isSelected: boolean) => React.ReactNode
  highlighted: boolean
}) {
  const date = new Date(snapshot.createdDate)
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' })

  return (
    <button
      onClick={onSelect}
      className={`
        w-full text-left px-3 py-2 relative flex items-start gap-3 cursor-pointer
        transition-all duration-200 group
        ${isSelected ? 'bg-accent/60' : 'hover:bg-secondary'}
      `}
    >
      {/* Timeline track */}
      <div className="flex flex-col items-center shrink-0 relative" style={{ width: 24 }}>
        {!isFirst && (
          <div className="w-px bg-border absolute -top-2 left-1/2 -translate-x-1/2 h-2" />
        )}
        <div
          className={`
            w-6 h-6 rounded-full flex items-center justify-center shrink-0
            transition-all duration-200 relative z-10
            ${
              isSelected
                ? highlighted
                  ? 'bg-info/20 ring-2 ring-info shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                  : 'bg-muted ring-2 ring-info shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                : highlighted
                  ? 'bg-secondary group-hover:bg-accent'
                  : 'bg-muted/60 group-hover:bg-muted'
            }
          `}
        >
          {highlighted ? (
            renderIcon(snapshot, isSelected)
          ) : (
            <Circle
              size={6}
              className={`${isSelected ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}
              fill="currentColor"
            />
          )}
        </div>
        {!isLast && (
          <div className="w-px bg-border absolute -bottom-2 left-1/2 -translate-x-1/2 h-2" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-0.5">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            Iteration {index + 1}
          </span>
          {renderBadge?.(snapshot, isSelected)}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[11px] text-muted-foreground truncate">{snapshot.authorName}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] text-muted-foreground/60">{dateStr}</span>
          <span className="text-[10px] text-muted-foreground/40">·</span>
          <span className="text-[10px] text-muted-foreground/60">{timeStr}</span>
        </div>
        {renderExtra?.(snapshot, isSelected)}
      </div>
    </button>
  )
}
