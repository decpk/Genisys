import { Check, Plus, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { IconButton } from '@/components/ui/icon-button'
import type { LabelSelectorProps } from './LabelSelector.types'
import { useLabelSelectorData } from './useLabelSelectorData'

export function LabelSelector(props: LabelSelectorProps): React.JSX.Element {
  const { itemId, assignedLabels, children } = props
  const {
    allLabels,
    assignedIds,
    isOpen,
    setIsOpen,
    newLabelName,
    setNewLabelName,
    handleToggleLabel,
    handleCreateLabel,
  } = useLabelSelectorData(itemId, assignedLabels)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-52 p-0"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-2 border-b border-border/50">
          <p className="text-xs font-medium text-muted-foreground px-1 mb-1">
            Labels
          </p>
        </div>
        <div className="max-h-48 overflow-y-auto p-1">
          {allLabels.map((label) => {
            const isAssigned = assignedIds.has(label.id)
            return (
              <button
                key={label.id}
                onClick={() => handleToggleLabel(label)}
                className={cn(
                  'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors hover:bg-accent',
                  isAssigned && 'bg-accent/50'
                )}
              >
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: label.color }}
                />
                <span className="flex-1 text-left truncate text-foreground">
                  {label.name}
                </span>
                {isAssigned && (
                  <Check size={14} className="text-primary shrink-0" />
                )}
              </button>
            )
          })}
        </div>
        <div className="p-1.5 border-t border-border/50">
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateLabel()
              }}
              placeholder="New label..."
              className="flex-1 text-xs bg-transparent border-none outline-none px-1 py-1 text-foreground placeholder:text-muted-foreground"
            />
            <IconButton
              onClick={handleCreateLabel}
              disabled={!newLabelName.trim()}
              variant="ghost"
              size="xs"
            >
              <Plus size={14} />
            </IconButton>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
