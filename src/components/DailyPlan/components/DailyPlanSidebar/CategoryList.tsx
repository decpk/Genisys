import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/Tooltip'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { CategoryDialog } from '../CategoryDialog/CategoryDialog'

export function CategoryList(): React.JSX.Element {
  const categories = useDailyPlanStore((s) => s.categories)
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Categories
        </span>
        <Tooltip content="Add category">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="size-3" />
          </Button>
        </Tooltip>
      </div>
      <div className="space-y-0.5">
        {categories.length === 0 && (
          <p className="text-xs text-muted-foreground py-2">No categories yet</p>
        )}
        {categories.map((cat) => (
          <button
            key={cat.id}
            className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-xs hover:bg-muted/80 transition-colors cursor-pointer text-left"
          >
            <span
              className="size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            <span className="truncate">{cat.name}</span>
          </button>
        ))}
      </div>
      <CategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
