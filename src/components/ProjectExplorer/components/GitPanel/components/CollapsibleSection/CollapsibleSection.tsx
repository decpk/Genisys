import { ChevronRight } from 'lucide-react'
import type { CollapsibleSectionProps } from './CollapsibleSection.types'

export function CollapsibleSection({
  title,
  count,
  isOpen,
  onToggle,
  children,
  hideCount
}: CollapsibleSectionProps): React.JSX.Element {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center w-full gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      >
        <ChevronRight
          size={12}
          className={`shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-90' : ''}`}
        />
        <span className="truncate">{title}</span>
        {!hideCount && (
          <span className="ml-auto text-[10px] tabular-nums font-normal opacity-70">{count}</span>
        )}
      </button>
      {isOpen && <div>{children}</div>}
    </div>
  )
}
