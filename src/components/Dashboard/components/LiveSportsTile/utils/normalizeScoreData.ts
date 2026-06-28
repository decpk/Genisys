import type { MatchData, MultiMatchScoreData, ScoreData } from '../LiveSportsTile.types'

/**
 * Normalize any score response into the multi-match format.
 * Handles:
 *  - New format: `{ matches: [...] }` → pass-through
 *  - Legacy format: flat `ScoreData` → wrap in `{ matches: [converted] }`
 */
export function normalizeScoreData(
  raw: MultiMatchScoreData | ScoreData,
): MultiMatchScoreData {
  // New multi-match format
  if ('matches' in raw && Array.isArray(raw.matches)) {
    return raw as MultiMatchScoreData
  }

  // Legacy single-match format — convert to MatchData
  const legacy = raw as ScoreData
  const match: MatchData = {
    competition: legacy.competition,
    matchTitle: '',
    status: legacy.status,
    teams: legacy.teams,
    period: legacy.period,
    venue: '',
    format: '',
    keyStats: [],
    battingStats: [],
    bowlingStats: [],
    recentEvents: [],
    extras: legacy.extras,
    lastUpdated: legacy.lastUpdated,
  }

  return { matches: [match] }
}
