import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

import { findCategory } from '../../data/categories'
import { useAppStoreActions } from '../../hooks/useAppStoreActions'
import { useAppStoreView } from '../../AppStoreViewContext'
import { AppStoreActionButton } from '../AppStoreActionButton'
import { AppStoreStatusBadge } from '../AppStoreStatusBadge'
import type { AppStoreAppCardProps } from './AppStoreAppCard.types'

/**
 * Compact horizontal app card used in category and search grids.
 * Clicking the icon / title navigates to the detail page; the action
 * button installs / opens / removes inline. When installed, a small
 * check badge on the icon makes ownership scannable at a glance.
 */
export function AppStoreAppCard(
  props: AppStoreAppCardProps,
): React.JSX.Element {
  const { app, showCategory = false } = props
  const { openDetail } = useAppStoreView()
  const { isInstalled } = useAppStoreActions()
  const Icon = app.icon
  const installed = isInstalled(app.id)
  const category = showCategory ? findCategory(app.category) : undefined
  const CategoryIcon = category?.icon

  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3',
        'cursor-pointer transition-colors hover:border-border/60 hover:bg-secondary/40',
      )}
      onClick={() => openDetail(app.id)}
    >
      <div className="relative shrink-0">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${app.accentColor}1f` }}
        >
          <Icon size={28} color={app.accentColor} strokeWidth={2} />
        </div>
        {installed ? (
          <span
            className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-emerald-500 text-white"
            title="Installed"
          >
            <Check size={11} strokeWidth={3} />
          </span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-foreground">
            {app.name}
          </span>
          {app.status ? <AppStoreStatusBadge status={app.status} /> : null}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {app.tagline}
        </div>
        {category ? (
          <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-muted-foreground/80">
            {CategoryIcon ? (
              <CategoryIcon size={11} color={category.accentColor} />
            ) : null}
            <span>{category.label}</span>
          </div>
        ) : null}
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        <AppStoreActionButton app={app} />
      </div>
    </div>
  )
}
