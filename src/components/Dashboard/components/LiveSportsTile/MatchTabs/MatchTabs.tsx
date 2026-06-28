import { memo, useState } from 'react'

import type { MatchData, MatchStatus } from '../LiveSportsTile.types'
import { MatchCard } from '../MatchCard'

interface MatchTabsProps {
  matches: MatchData[]
  /** Flat map of `"matchIdx-teamName" → previousScore` for flash animations */
  prevScoresMap: Map<string, string>
}

function getTabStatusDot(status: MatchStatus): string {
  switch (status) {
    case 'live':
      return 'bg-green-500'
    case 'completed':
      return 'bg-muted-foreground/50'
    case 'upcoming':
      return 'bg-blue-500'
    default:
      return 'bg-muted-foreground/30'
  }
}

function getShortTeamLabel(match: MatchData): string {
  if (match.teams.length >= 2) {
    // Use first 3 chars of each team for compact tab label
    const a = match.teams[0].name.slice(0, 3).toUpperCase()
    const b = match.teams[1].name.slice(0, 3).toUpperCase()
    return `${a} v ${b}`
  }
  if (match.teams.length === 1) {
    return match.teams[0].name.slice(0, 6)
  }
  return match.matchTitle || match.competition.slice(0, 10)
}

export const MatchTabs = memo(function MatchTabs({
  matches,
  prevScoresMap,
}: MatchTabsProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState(0)

  // Clamp active tab to valid range when matches change
  const safeActiveTab = activeTab >= matches.length ? 0 : activeTab

  const activeMatch = matches[safeActiveTab]

  // Build per-match prevScores map for the active match
  const perMatchPrev = new Map<string, string>()
  if (activeMatch) {
    for (const team of activeMatch.teams) {
      const key = `${safeActiveTab}-${team.name}`
      const prev = prevScoresMap.get(key)
      if (prev !== undefined) {
        perMatchPrev.set(team.name, prev)
      }
    }
  }

  return (
    <div className="flex flex-col h-full gap-0">
      {/* Tab bar — only when multiple matches */}
      {matches.length > 1 && (
        <div className="flex flex-col gap-1.5 pb-2">
          <div className="flex items-center gap-0.5 px-0.5 overflow-x-auto scrollbar-none">
            {matches.map((match, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-all duration-150 shrink-0 ${
                  i === safeActiveTab
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getTabStatusDot(match.status)}`} />
                {getShortTeamLabel(match)}
              </button>
            ))}
          </div>
          {/* Color legend */}
          <div className="flex items-center gap-3 px-1">
            <span className="flex items-center gap-1 text-[9px] text-muted-foreground/60">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />Live
            </span>
            <span className="flex items-center gap-1 text-[9px] text-muted-foreground/60">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />Upcoming
            </span>
            <span className="flex items-center gap-1 text-[9px] text-muted-foreground/60">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />Completed
            </span>
          </div>
        </div>
      )}

      {/* Active match content */}
      {activeMatch && (
        <div className="flex-1 overflow-y-auto pr-0.5 matches-scroll-container">
          <MatchCard
            key={`tab-${safeActiveTab}-${activeMatch.teams.map((t) => t.name).join('-')}`}
            match={activeMatch}
            matchIndex={safeActiveTab}
            totalMatches={matches.length}
            prevScores={perMatchPrev}
          />
        </div>
      )}
    </div>
  )
})
