import type { AppStoreDetailHeroProps } from './AppStoreDetailHero.types'

/** Top hero block on the detail page: big icon + name + tagline + CTA slot. */
export function AppStoreDetailHero(
  props: AppStoreDetailHeroProps,
): React.JSX.Element {
  const { app, children } = props
  const Icon = app.icon

  return (
    <div className="flex items-start gap-6">
      <div
        className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl shadow-sm"
        style={{ backgroundColor: `${app.accentColor}26` }}
      >
        <Icon size={48} color={app.accentColor} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1 pt-2">
        <h1 className="text-2xl font-bold leading-tight text-foreground">
          {app.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{app.tagline}</p>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}
