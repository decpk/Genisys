import { findCategory } from '../../data/categories'
import { findAppEntry } from '../../data/app-catalog'
import { AppStoreActionButton } from '../AppStoreActionButton'
import { AppStoreDetailHero } from './AppStoreDetailHero'
import { AppStoreDetailFeatures } from './AppStoreDetailFeatures'
import { AppStoreDetailMeta } from './AppStoreDetailMeta'
import type { AppStoreDetailProps } from './AppStoreDetail.types'

/**
 * Rich app detail page \u2014 mirrors the Mac App Store layout. On wide
 * screens the hero spans the full width and the body splits into a
 * main content column (About / Features / What's New) and a sticky
 * right-side info panel (Version / Category / Status). On narrower
 * screens everything stacks into a single column.
 */
export function AppStoreDetail(
  props: AppStoreDetailProps,
): React.JSX.Element | null {
  const { appId } = props
  const app = findAppEntry(appId)
  if (!app) return null

  const category = findCategory(app.category)
  const categoryLabel = category?.label ?? ''
  const isLocked = app.locked === true

  return (
    <div className="px-8 py-8">
      <AppStoreDetailHero app={app}>
        <AppStoreActionButton app={app} size="md" />
      </AppStoreDetailHero>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <section>
            <h2 className="mb-3 text-lg font-bold text-foreground">About</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {app.description}
            </p>
          </section>

          <AppStoreDetailFeatures features={app.features} />

          {app.whatsNew && app.whatsNew.length > 0 ? (
            <section className="mt-10">
              <h2 className="mb-3 text-lg font-bold text-foreground">
                What&rsquo;s New
              </h2>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {app.whatsNew.map((line, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary">{'\u2022'}</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-0 lg:self-start">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Information
          </h2>
          <AppStoreDetailMeta
            version={app.version}
            categoryLabel={categoryLabel}
            locked={isLocked}
            status={app.status}
            direction="vertical"
          />
        </aside>
      </div>
    </div>
  )
}
