import type { AppStoreSectionProps } from './AppStoreSection.types'

/** Section title + subtitle wrapper used across the App Store views. */
export function AppStoreSection(
  props: AppStoreSectionProps,
): React.JSX.Element {
  const { title, subtitle, children } = props
  return (
    <section className="mb-8">
      <div className="mb-3">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}
