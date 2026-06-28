import type { AppStoreViewHeaderProps } from './AppStoreViewHeader.types'

/**
 * Shared page header used by the Category, Installed, and Search views.
 * Renders an optional tinted icon tile, a title with an optional count
 * pill, and a supporting subtitle so every browse surface reads the
 * same way.
 */
export function AppStoreViewHeader(
  props: AppStoreViewHeaderProps,
): React.JSX.Element {
  const { icon: Icon, accentColor, title, subtitle, count } = props

  return (
    <div className="mb-6 flex items-center gap-3.5">
      {Icon ? (
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${accentColor ?? '#64748B'}1f` }}
        >
          <Icon size={22} color={accentColor ?? '#64748B'} strokeWidth={2.25} />
        </div>
      ) : null}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="truncate text-2xl font-bold text-foreground">
            {title}
          </h1>
          {typeof count === 'number' ? (
            <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              {count}
            </span>
          ) : null}
        </div>
        {subtitle ? (
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  )
}
