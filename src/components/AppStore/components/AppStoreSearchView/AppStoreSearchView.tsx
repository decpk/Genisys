import { Search } from 'lucide-react'

import { APP_CATALOG } from '../../data/app-catalog'
import { AppStoreAppCard } from '../AppStoreAppCard'
import { AppStoreViewHeader } from '../AppStoreViewHeader'
import type { AppStoreSearchViewProps } from './AppStoreSearchView.types'
import { scoreAppForQuery } from './utils/scoreAppForQuery'

/**
 * Live search results. Sorted by a simple weighted score against name
 * / tagline / description / feature text. Shows an empty state when
 * nothing matches.
 */
export function AppStoreSearchView(
  props: AppStoreSearchViewProps,
): React.JSX.Element {
  const { query } = props
  const q = query.trim().toLowerCase()

  const matches = APP_CATALOG
    .map((app) => ({ app, score: scoreAppForQuery(app, q) }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)

  if (matches.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/60">
          <Search size={24} className="text-muted-foreground" />
        </div>
        <div className="mt-4 text-base font-semibold text-foreground">
          No results for &ldquo;{query}&rdquo;
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          Try a different search term or browse a category.
        </div>
      </div>
    )
  }

  return (
    <div className="px-8 py-6">
      <AppStoreViewHeader
        icon={Search}
        accentColor="#0EA5E9"
        title={`Results for \u201c${query}\u201d`}
        subtitle={`${matches.length} app${
          matches.length === 1 ? '' : 's'
        } found.`}
        count={matches.length}
      />
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
        {matches.map(({ app }) => (
          <AppStoreAppCard key={app.id} app={app} showCategory />
        ))}
      </div>
    </div>
  )
}
