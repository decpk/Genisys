import { Search, X, ChevronUp, ChevronDown, SearchX } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import { useSearchPanelData } from './useSearchPanelData'
import { searchPanelStyles } from './SearchPanel.styles'
import { SearchResultItem } from './SearchResultItem'

export function SearchPanel(): React.JSX.Element {
  const {
    searchQuery,
    currentMatchIndex,
    totalMatches,
    matches,
    setSearchQuery,
    navigateMatch,
    scrollToMatch,
    clearSearch,
    inputRef,
    resultsRef,
    handleKeyDown,
    virtualizer,
  } = useSearchPanelData()

  const hasQuery = searchQuery.length > 0
  const hasResults = matches.length > 0

  const matchCountLabel = hasQuery
    ? (totalMatches > 0 ? `${currentMatchIndex}/${totalMatches}` : '0')
    : ''

  return (
    <div className="flex flex-col h-full">
      {/* Search input — fixed height, never changes */}
      <div className={searchPanelStyles.header}>
        <div className={searchPanelStyles.inputWrapper}>
          <Search size={14} className="shrink-0 text-muted-foreground/40" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search in chapter…"
            className={searchPanelStyles.input}
            spellCheck={false}
            autoFocus
          />
          {hasQuery && (
            <>
              <span className={searchPanelStyles.matchBadge}>
                {matchCountLabel}
              </span>
              <div className={searchPanelStyles.divider} />
              <IconButton
                variant="default"
                size="xs"
                onClick={() => navigateMatch('prev')}
                disabled={totalMatches === 0}
                tooltip="Previous match"
                className={searchPanelStyles.navButton}
              >
                <ChevronUp size={13} />
              </IconButton>
              <IconButton
                variant="default"
                size="xs"
                onClick={() => navigateMatch('next')}
                disabled={totalMatches === 0}
                tooltip="Next match"
                className={searchPanelStyles.navButton}
              >
                <ChevronDown size={13} />
              </IconButton>
              <div className={searchPanelStyles.divider} />
              <IconButton variant="default" size="xs" onClick={clearSearch} tooltip="Clear search" className={searchPanelStyles.clearButton}>
                <X size={12} />
              </IconButton>
            </>
          )}
        </div>
      </div>

      {/* Stats bar */}
      {hasQuery && hasResults && (
        <div className={searchPanelStyles.statsRow}>
          <span className={searchPanelStyles.statsText}>
            {totalMatches} result{totalMatches !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Results list — virtualized */}
      {hasQuery && hasResults && (
        <div ref={resultsRef} className={searchPanelStyles.resultsList}>
          <div
            className="relative w-full"
            style={{ height: virtualizer.getTotalSize() }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const match = matches[virtualRow.index]
              const isActive = match.index === currentMatchIndex - 1
              return (
                <div
                  key={virtualRow.index}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  className="absolute left-0 w-full"
                  style={{ top: virtualRow.start }}
                >
                  <SearchResultItem
                    match={match}
                    isActive={isActive}
                    searchQuery={searchQuery}
                    onNavigate={scrollToMatch}
                    showSeparator={virtualRow.index > 0}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* No results */}
      {hasQuery && !hasResults && (
        <div className={searchPanelStyles.emptyState}>
          <SearchX size={28} className="text-muted-foreground/15" />
          <p className="text-[11px] font-medium text-muted-foreground/40">No matches found</p>
          <p className="text-[10px] text-muted-foreground/25">Try a different search term</p>
        </div>
      )}

      {/* Idle state */}
      {!hasQuery && (
        <div className={searchPanelStyles.emptyState}>
          <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center">
            <Search size={18} className="text-muted-foreground/20" />
          </div>
          <p className="text-[11px] font-medium text-muted-foreground/40">Find in chapter</p>
          <p className="text-[10px] text-muted-foreground/25">Type to search • ⌘F to focus</p>
        </div>
      )}
    </div>
  )
}
