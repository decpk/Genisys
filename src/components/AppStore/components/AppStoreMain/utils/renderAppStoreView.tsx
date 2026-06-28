import type { ComponentType } from 'react'

import type { AppView } from '@/components/ActivityBar'

import type { AppCategoryId } from '../../../AppStore.types'
import type { AppStoreView } from '../../../AppStoreView.types'

interface ViewComponents {
  Discover: ComponentType
  All: ComponentType
  Installed: ComponentType
  Category: ComponentType<{ categoryId: AppCategoryId }>
  Search: ComponentType<{ query: string }>
  Detail: ComponentType<{ appId: AppView }>
}

/**
 * Tiny dispatcher that maps the current view to a JSX element. Keeps
 * the router component small and the dispatch table explicit.
 */
export function renderAppStoreView(
  view: AppStoreView,
  views: ViewComponents,
): React.JSX.Element {
  if (view.kind === 'discover') return <views.Discover />
  if (view.kind === 'all') return <views.All />
  if (view.kind === 'installed') return <views.Installed />
  if (view.kind === 'category') return <views.Category categoryId={view.id} />
  if (view.kind === 'search') return <views.Search query={view.query} />
  return <views.Detail appId={view.appId} />
}
