import { ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { AppStoreCategoryTileProps } from './AppStoreCategoryTile.types'

/**
 * Large clickable tile used in the Discover view's "Browse by Category"
 * grid. Each tile carries the category's icon, label, app count, and
 * tagline, tinted with the category accent so the four categories are
 * instantly distinguishable.
 */
export function AppStoreCategoryTile(
  props: AppStoreCategoryTileProps,
): React.JSX.Element {
  const { category, count, onClick } = props
  const Icon = category.icon

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-3.5 overflow-hidden rounded-2xl border border-border/40 p-4 text-left',
        'transition-colors hover:border-border hover:bg-secondary/40',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
      )}
      style={{
        background: `linear-gradient(135deg, ${category.accentColor}14 0%, transparent 70%)`,
      }}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
        style={{ backgroundColor: `${category.accentColor}26` }}
      >
        <Icon size={24} color={category.accentColor} strokeWidth={2.25} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-bold text-foreground">
            {category.label}
          </span>
          <span className="shrink-0 text-xs font-medium text-muted-foreground">
            {count} app{count === 1 ? '' : 's'}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {category.tagline}
        </p>
      </div>
      <ChevronRight
        size={18}
        className="shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground"
      />
    </button>
  )
}
