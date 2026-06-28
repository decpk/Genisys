import type { AppFeature } from '../../AppStore.types'

export interface AppStoreDetailFeaturesProps {
  features: AppFeature[]
}

/** Two-column feature grid on the detail page. */
export function AppStoreDetailFeatures(
  props: AppStoreDetailFeaturesProps,
): React.JSX.Element {
  const { features } = props
  return (
    <div className="mt-10">
      <h2 className="mb-3 text-lg font-bold text-foreground">Features</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {features.map((f, i) => {
          const Icon = f.icon
          return (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border border-border/40 bg-card/20 p-3"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon size={16} className="text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">
                  {f.title}
                </div>
                <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {f.description}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
