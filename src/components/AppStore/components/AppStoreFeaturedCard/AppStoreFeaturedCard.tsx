import { cn } from '@/lib/utils'

import { useAppStoreView } from '../../AppStoreViewContext'
import { AppStoreActionButton } from '../AppStoreActionButton'
import type { AppStoreFeaturedCardProps } from './AppStoreFeaturedCard.types'

/**
 * Large hero card used in the Discover view's "Featured" rail. Renders
 * the app's icon at scale on a tinted gradient background, with the
 * tagline and a primary CTA.
 */
export function AppStoreFeaturedCard(
  props: AppStoreFeaturedCardProps,
): React.JSX.Element {
  const { app } = props
  const { openDetail } = useAppStoreView()
  const Icon = app.icon

  return (
    <div
      className={cn(
        'group relative flex h-44 cursor-pointer flex-col justify-between overflow-hidden',
        'rounded-3xl border border-border/40 p-5 transition-transform hover:scale-[1.01]',
      )}
      style={{
        background: `linear-gradient(135deg, ${app.accentColor}26 0%, ${app.accentColor}0a 60%, transparent 100%)`,
      }}
      onClick={() => openDetail(app.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm"
            style={{ backgroundColor: `${app.accentColor}38` }}
          >
            <Icon size={24} color={app.accentColor} strokeWidth={2.25} />
          </div>
          <div>
            <div
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: app.accentColor }}
            >
              Featured
            </div>
            <div className="text-base font-bold text-foreground">{app.name}</div>
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <AppStoreActionButton app={app} />
        </div>
      </div>
      <div>
        <div className="line-clamp-1 text-lg font-bold leading-tight text-foreground">
          {app.tagline}
        </div>
        <div className="mt-1 line-clamp-2 max-w-md text-sm text-muted-foreground">
          {app.description}
        </div>
      </div>
    </div>
  )
}
