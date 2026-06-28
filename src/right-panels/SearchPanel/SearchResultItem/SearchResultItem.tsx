import { memo, useMemo } from 'react'

import { searchResultStyles } from '../SearchPanel.styles'
import type { SearchResultItemProps } from './SearchResultItem.types'

function SearchResultItemComponent(props: SearchResultItemProps): React.JSX.Element {
  const { match, isActive, searchQuery, onNavigate, showSeparator } = props

  const stateClass = isActive ? searchResultStyles.active : searchResultStyles.idle
  const highlightClass = isActive
    ? searchResultStyles.activeMatchHighlight
    : searchResultStyles.matchHighlight
  const badgeClass = isActive
    ? searchResultStyles.activeIndexBadge
    : searchResultStyles.indexBadge

  const parts = useMemo(() => {
    const surrounding = match.surroundingText
    const lowerSurrounding = surrounding.toLowerCase()
    const lowerQuery = searchQuery.toLowerCase()
    const result: { text: string; isMatch: boolean }[] = []
    let lastIdx = 0
    let idx = lowerSurrounding.indexOf(lowerQuery, lastIdx)

    while (idx !== -1) {
      if (idx > lastIdx) {
        result.push({ text: surrounding.slice(lastIdx, idx), isMatch: false })
      }
      result.push({ text: surrounding.slice(idx, idx + searchQuery.length), isMatch: true })
      lastIdx = idx + searchQuery.length
      idx = lowerSurrounding.indexOf(lowerQuery, lastIdx)
    }

    if (lastIdx < surrounding.length) {
      result.push({ text: surrounding.slice(lastIdx), isMatch: false })
    }

    return result
  }, [match.surroundingText, searchQuery])

  return (
    <>
      {showSeparator && <div className={searchResultStyles.separator} />}
      <button
        onClick={() => onNavigate(match.index)}
        className={`${searchResultStyles.base} ${stateClass}`}
      >
        {isActive && <div className={searchResultStyles.activeIndicator} />}
        <div className="flex items-start gap-2.5 pl-1">
          <span className={badgeClass}>
            {match.index + 1}
          </span>
          <p className={searchResultStyles.text}>
            {parts.map((part, i) => {
              if (part.isMatch) {
                return (
                  <span key={i} className={highlightClass}>
                    {part.text}
                  </span>
                )
              }
              return <span key={i}>{part.text}</span>
            })}
          </p>
        </div>
      </button>
    </>
  )
}

export const SearchResultItem = memo(SearchResultItemComponent)
