import { memo } from 'react'
import { MapPin, Zap } from 'lucide-react'

import type { MatchData, MatchStatus } from '../LiveSportsTile.types'

interface MatchCardProps {
  match: MatchData
  matchIndex: number
  totalMatches: number
  /** Map of `teamName → previousScore` for flash animation */
  prevScores: Map<string, string>
}

function getStatusBadgeClasses(status: MatchStatus): string {
  switch (status) {
    case 'live':
      return 'bg-green-500/15 text-green-500'
    case 'completed':
      return 'bg-muted text-muted-foreground'
    case 'upcoming':
      return 'bg-blue-500/15 text-blue-500'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

function getStatusText(status: MatchStatus): string {
  return status === 'live' ? '● LIVE' : status.toUpperCase()
}

export const MatchCard = memo(function MatchCard({
  match,
  matchIndex,
  totalMatches,
  prevScores,
}: MatchCardProps): React.JSX.Element {
  return (
    <div
      className="match-card-enter rounded-lg border border-border/50 bg-accent/20 p-3 flex flex-col gap-2.5"
      style={{ animationDelay: `${matchIndex * 80}ms` }}
    >
      {/* Match header: status + competition + format + match count */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${getStatusBadgeClasses(match.status)}`}
        >
          {getStatusText(match.status)}
        </span>

        <span className="text-xs text-muted-foreground truncate flex-1 min-w-0">
          {match.competition}
        </span>

        {match.format && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium uppercase shrink-0">
            {match.format}
          </span>
        )}

        {totalMatches > 1 && (
          <span className="text-[9px] text-muted-foreground/60 tabular-nums shrink-0">
            {matchIndex + 1}/{totalMatches}
          </span>
        )}
      </div>

      {/* Match title (e.g. "41st Match") */}
      {match.matchTitle && (
        <p className="text-[11px] text-muted-foreground/80 -mt-1">
          {match.matchTitle}
        </p>
      )}

      {/* Teams & scores */}
      <div className="flex flex-col gap-1.5">
        {match.teams.map((team) => {
          const prevScore = prevScores.get(team.name)
          const scoreChanged = prevScore !== undefined && prevScore !== team.score

          return (
            <div
              key={team.name}
              className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-md bg-background/60 ${scoreChanged ? 'score-flash' : ''}`}
            >
              <span className="text-sm font-medium truncate">{team.name}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  key={`${team.name}-${team.score}`}
                  className={`text-sm font-bold tabular-nums ${scoreChanged ? 'score-slide-in' : ''}`}
                >
                  {team.score}
                </span>
                {team.detail && (
                  <span className="text-[10px] text-muted-foreground max-w-[140px] truncate">
                    {team.detail}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Key stats pills */}
      {match.keyStats.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {match.keyStats.map((stat, i) => (
            <span
              key={i}
              className="key-stat-pill text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary/90 border border-primary/10"
            >
              {stat}
            </span>
          ))}
        </div>
      )}

      {/* Batting stats table */}
      {match.battingStats && match.battingStats.length > 0 && (
        <div className="flex flex-col gap-1 pt-1">
          <span className="text-[10px] font-medium text-muted-foreground/80 uppercase tracking-wide">Batting</span>
          <div className="rounded-md border border-border/30 overflow-hidden">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="bg-accent/30 text-muted-foreground/70">
                  <th className="text-left py-1 px-2 font-medium">Batter</th>
                  <th className="text-right py-1 px-2 font-medium">R</th>
                  <th className="text-right py-1 px-2 font-medium">B</th>
                  <th className="text-right py-1 px-2 font-medium">Info</th>
                </tr>
              </thead>
              <tbody>
                {match.battingStats.map((b, i) => (
                  <tr key={i} className="border-t border-border/20">
                    <td className="py-1 px-2 font-medium truncate max-w-[120px]">{b.name}</td>
                    <td className="py-1 px-2 text-right tabular-nums font-semibold">{b.runs}</td>
                    <td className="py-1 px-2 text-right tabular-nums text-muted-foreground">{b.balls}</td>
                    <td className="py-1 px-2 text-right text-muted-foreground truncate max-w-[80px]">{b.extras}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bowling stats table */}
      {match.bowlingStats && match.bowlingStats.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-medium text-muted-foreground/80 uppercase tracking-wide">Bowling</span>
          <div className="rounded-md border border-border/30 overflow-hidden">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="bg-accent/30 text-muted-foreground/70">
                  <th className="text-left py-1 px-2 font-medium">Bowler</th>
                  <th className="text-right py-1 px-2 font-medium">Figures</th>
                  <th className="text-right py-1 px-2 font-medium">Econ</th>
                </tr>
              </thead>
              <tbody>
                {match.bowlingStats.map((b, i) => (
                  <tr key={i} className="border-t border-border/20">
                    <td className="py-1 px-2 font-medium truncate max-w-[120px]">{b.name}</td>
                    <td className="py-1 px-2 text-right tabular-nums font-semibold">{b.figures}</td>
                    <td className="py-1 px-2 text-right tabular-nums text-muted-foreground">{b.economy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent events / commentary */}
      {match.recentEvents && match.recentEvents.length > 0 && (
        <div className="flex flex-col gap-1 pt-0.5">
          <span className="text-[10px] font-medium text-muted-foreground/80 uppercase tracking-wide flex items-center gap-1">
            <Zap size={9} />
            Recent
          </span>
          <div className="flex flex-col gap-1">
            {match.recentEvents.map((event, i) => (
              <div
                key={i}
                className="text-[10px] text-muted-foreground/90 pl-2 border-l-2 border-primary/20 leading-relaxed"
              >
                {event}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Period + venue row */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground/70">
        {match.period && <span>{match.period}</span>}
        {match.venue && (
          <span className="flex items-center gap-1 truncate">
            <MapPin size={9} className="shrink-0" />
            {match.venue}
          </span>
        )}
      </div>

      {/* Extras */}
      {match.extras && Object.keys(match.extras).length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 pt-0.5 border-t border-border/30">
          {Object.entries(match.extras).map(([key, value]) => (
            <span key={key} className="text-[10px] text-muted-foreground">
              <span className="font-medium">{key}:</span> {value}
            </span>
          ))}
        </div>
      )}
    </div>
  )
})
