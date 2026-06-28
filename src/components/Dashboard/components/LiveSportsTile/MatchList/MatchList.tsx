import { memo, useCallback, useRef, useState, useEffect } from 'react'

import type { MatchData } from '../LiveSportsTile.types'
import { MatchCard } from '../MatchCard'

interface MatchListProps {
  matches: MatchData[]
  /** Flat map of `"matchIdx-teamName" → previousScore` for flash animations */
  prevScoresMap: Map<string, string>
}

export const MatchList = memo(function MatchList({
  matches,
  prevScoresMap,
}: MatchListProps): React.JSX.Element {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return

    const children = Array.from(el.children) as HTMLElement[]
    if (children.length === 0) return

    // Find the child closest to the scroll top
    const scrollTop = el.scrollTop
    let closest = 0
    let closestDist = Infinity
    for (let i = 0; i < children.length; i++) {
      const dist = Math.abs(children[i].offsetTop - scrollTop)
      if (dist < closestDist) {
        closestDist = dist
        closest = i
      }
    }
    setActiveIndex(closest)
  }, [])

  // Reset active index when matches change
  useEffect(() => {
    setActiveIndex(0)
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [matches.length])

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable match container — one match visible at a time */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="matches-scroll-container flex-1 overflow-y-auto flex flex-col pr-0.5"
      >
        {matches.map((match, i) => {
          // Build per-match prevScores map
          const perMatchPrev = new Map<string, string>()
          for (const team of match.teams) {
            const key = `${i}-${team.name}`
            const prev = prevScoresMap.get(key)
            if (prev !== undefined) {
              perMatchPrev.set(team.name, prev)
            }
          }

          return (
            <MatchCard
              key={`${i}-${match.teams.map((t) => t.name).join('-')}`}
              match={match}
              matchIndex={i}
              totalMatches={matches.length}
              prevScores={perMatchPrev}
            />
          )
        })}
      </div>

      {/* Scroll indicator — only when multiple matches */}
      {matches.length > 1 && (
        <div className="flex items-center justify-center gap-1 pt-2 pb-0.5">
          {matches.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                const el = scrollRef.current
                const children = el ? (Array.from(el.children) as HTMLElement[]) : []
                if (children[i]) {
                  children[i].scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                i === activeIndex
                  ? 'bg-primary w-4'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to match ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
})
