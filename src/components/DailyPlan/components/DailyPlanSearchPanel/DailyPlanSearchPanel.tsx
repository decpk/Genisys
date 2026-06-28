import { Search, X, SearchX } from 'lucide-react'

import { AppLoader } from '@/components/AppLoader'
import { AppInlineLoader } from '@/components/AppLoader'
import { useDailyPlanStore } from '@/store/daily-plan-store'

import { dailyPlanSearchPanelStyles as styles } from './DailyPlanSearchPanel.styles'
import { useDailyPlanSearchPanelData } from './useDailyPlanSearchPanelData'
import { SearchResultItem } from './SearchResultItem'

export function DailyPlanSearchPanel(): React.JSX.Element {
  const {
    query,
    handleQueryChange,
    clearSearch,
    displayedResults,
    totalCount,
    hasMore,
    showMore,
    isSearching,
    isLoadingMore,
    hasQuery,
    hasResults,
    showEmptyState,
    inputRef,
  } = useDailyPlanSearchPanelData()

  const setSelectedDate = useDailyPlanStore((s) => s.setSelectedDate)

  const handleNavigate = (date: string) => {
    setSelectedDate(date)
  }

  const statsLabel = hasQuery && hasResults
    ? `${totalCount} result${totalCount !== 1 ? 's' : ''}`
    : ''

  return (
    <div className={styles.root}>
      {/* Search input */}
      <div className={styles.header}>
        <div className={styles.inputWrapper}>
          <Search size={14} className="shrink-0 text-muted-foreground/40" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search tasks & meetings…"
            className={styles.input}
            spellCheck={false}
            autoFocus
          />
          {hasQuery && (
            <button type="button" onClick={clearSearch} className={styles.clearButton}>
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      {statsLabel && (
        <div className={styles.statsRow}>
          <span className={styles.statsText}>{statsLabel}</span>
        </div>
      )}

      {/* Loading state */}
      {isSearching && !hasResults && (
        <AppLoader size={24} text="Searching…" />
      )}

      {/* Empty state */}
      {showEmptyState && (
        <div className={styles.emptyState}>
          <SearchX size={32} />
          <span className={styles.emptyText}>No results found</span>
        </div>
      )}

      {/* Results list */}
      {hasResults && (
        <div className={styles.resultsList}>
          {displayedResults.map((item) => (
            <div key={`${item.type}-${item.data.id}`}>
              <SearchResultItem item={item} onNavigate={handleNavigate} />
              <div className="mx-3 h-px bg-border/20" />
            </div>
          ))}

          {/* Show More button */}
          {hasMore && (
            <div className={styles.showMoreWrapper}>
              {isLoadingMore && (
                <AppInlineLoader message="Loading more…" size={16} />
              )}
              {!isLoadingMore && (
                <button type="button" className={styles.showMoreButton} onClick={showMore}>
                  Show More Results
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
