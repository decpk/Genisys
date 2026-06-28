import type { TileWidth } from '@/store/dashboard-store'

export type SportKey =
  | 'cricket'
  | 'football'
  | 'nba'
  | 'nfl'
  | 'tennis'
  | 'f1'
  | 'baseball'
  | 'hockey'
  | 'esports'
  | 'golf'
  | 'table-tennis'
  | 'chess'
  | 'badminton'
  | 'boxing'
  | 'cycling'
  | 'rugby'
  | 'volleyball'
  | 'custom'

export type RefreshInterval = 0 | 30_000 | 60_000 | 120_000 | 300_000

export type NotifyChannel = "off" | "app" | "os" | "both";

export interface LiveSportTileConfig {
  id: string;
  query: string;
  sportKey: SportKey;
  createdAt: string;
  refreshIntervalMs: RefreshInterval;
  tileWidth: TileWidth;
  sourceUrl: string;
  notifyOnScore: boolean;
  notifyOnStatus: boolean;
  notifyOnPeriod: boolean;
  notifyWhenFocused: NotifyChannel;
  notifyWhenUnfocused: NotifyChannel;
  autoDeleteOnEnd: boolean;
}

export interface TeamScore {
  name: string
  score: string
  detail: string
}

export interface ScoreData {
  competition: string
  status: 'live' | 'completed' | 'upcoming' | 'no-live-match'
  teams: TeamScore[]
  period: string
  extras: Record<string, string>
  lastUpdated: string
}

export type MatchStatus = 'live' | 'completed' | 'upcoming' | 'no-live-match'

export interface PlayerBattingStat {
  name: string
  runs: string
  balls: string
  extras: string
}

export interface PlayerBowlingStat {
  name: string
  figures: string
  economy: string
}

export interface MatchData {
  competition: string
  matchTitle: string
  status: MatchStatus
  teams: TeamScore[]
  period: string
  venue: string
  format: string
  keyStats: string[]
  battingStats: PlayerBattingStat[]
  bowlingStats: PlayerBowlingStat[]
  recentEvents: string[]
  extras: Record<string, string>
  lastUpdated: string
}

export interface MultiMatchScoreData {
  matches: MatchData[]
}

/** Normalized format — always an array of matches */
export type NormalizedScoreData = MultiMatchScoreData

export type FetchStatus = 'idle' | 'resolving-url' | 'crawling' | 'parsing' | 'ready' | 'error'

export interface LiveScoreRuntime {
  status: FetchStatus
  sourceUrl: string | null
  scoreData: ScoreData | null
  lastFetchedAt: string | null
  error: string | null
}

export const REFRESH_OPTIONS: { value: RefreshInterval; label: string }[] = [
  { value: 0, label: 'Off' },
  { value: 30_000, label: '30s' },
  { value: 60_000, label: '1m' },
  { value: 120_000, label: '2m' },
  { value: 300_000, label: '5m' },
]

export const THROTTLE_COOLDOWN_MS = 30_000
