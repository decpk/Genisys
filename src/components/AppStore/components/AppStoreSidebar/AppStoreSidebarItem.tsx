import { cn } from '@/lib/utils'

import type { AppStoreSidebarItemProps } from './AppStoreSidebarItem.types'

/**
 * Single sidebar row \u2014 small icon (optional) + label + optional count
 * badge, with an active "pill" highlight. Used by Discover, Installed,
 * and each category.
 */
export function AppStoreSidebarItem(
  props: AppStoreSidebarItemProps,
): React.JSX.Element {
  const { icon: Icon, iconColor, label, count, active, onClick } = props
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors',
        active
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
      )}
    >
      {Icon ? (
        <Icon
          size={16}
          strokeWidth={active ? 2.5 : 2}
          color={!active && iconColor ? iconColor : undefined}
        />
      ) : null}
      <span className="flex-1 truncate text-left">{label}</span>
      {typeof count === 'number' ? (
        <span
          className={cn(
            'shrink-0 text-xs tabular-nums',
            active ? 'text-primary/70' : 'text-muted-foreground/60',
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  )
}
