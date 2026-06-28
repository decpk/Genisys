import { ChevronLeft, Search, X } from 'lucide-react'

import { cn } from '@/lib/utils'

import { getTotalAppCount } from '../../data/app-catalog'
import { useAppStoreView } from '../../AppStoreViewContext'

/**
 * Sticky top bar with a Mac-style "<" back button (on detail + category
 * views) and a prominent, centered search input that switches the view
 * to {@link AppStoreSearchView} as the user types.
 */
export function AppStoreHeader(): React.JSX.Element {
  const { view, openDiscover, setSearchQuery } = useAppStoreView()
  const searchValue = view.kind === 'search' ? view.query : ''
  const showBack = view.kind === 'detail' || view.kind === 'category'

  return (
    <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border/40 bg-card/60 px-4 backdrop-blur">
      {showBack ? (
        <button
          type="button"
          onClick={openDiscover}
          className="flex h-8 shrink-0 items-center gap-1 rounded-full px-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Back"
        >
          <ChevronLeft size={18} />
          <span>Back</span>
        </button>
      ) : null}

      <div className="relative mx-auto flex w-full max-w-xl items-center">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 text-muted-foreground"
        />
        <input
          type="search"
          placeholder={`Search ${getTotalAppCount()} apps\u2026`}
          value={searchValue}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            'h-9 w-full rounded-lg bg-secondary/60 pl-9 pr-9 text-sm text-foreground outline-none',
            'placeholder:text-muted-foreground',
            'focus-visible:ring-2 focus-visible:ring-primary/40',
            '[&::-webkit-search-cancel-button]:appearance-none',
          )}
        />
        {searchValue ? (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
            className="absolute right-2 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>
    </div>
  )
}
