import {
  Trophy, Swords, Shield, Target,
  Flag, Gamepad2, CircleDot, Gauge, Orbit, HelpCircle, Goal,
} from 'lucide-react'
import type { IconType } from 'react-icons'
import { GiCricketBat, GiSoccerBall, GiTennisBall, GiBaseballBat, GiHockey, GiConsoleController, GiGolfFlag, GiF1Car, GiAmericanFootballBall, GiPingPongBat, GiChessKnight, GiShuttlecock, GiBoxingGlove, GiCycling, GiRugbyConversion, GiVolleyballBall } from 'react-icons/gi'
import { SiNba } from 'react-icons/si'

import type { SportKey } from './LiveSportsTile.types'

export interface SportsCatalogEntry {
  key: SportKey
  label: string
  icon: typeof Trophy
  defaultQuery: string
  image?: IconType
  brandColor?: string
}

export const SPORTS_CATALOG: SportsCatalogEntry[] = [
  { key: 'cricket', label: 'Cricket', icon: Target, defaultQuery: 'Live Cricket scores today', image: GiCricketBat, brandColor: '#1B5E20' },
  { key: 'football', label: 'Football', icon: Goal, defaultQuery: 'Live Football Soccer scores today', image: GiSoccerBall, brandColor: '#0F766E' },
  { key: 'nba', label: 'NBA', icon: CircleDot, defaultQuery: 'Live NBA Basketball scores today', image: SiNba, brandColor: '#C9082A' },
  { key: 'nfl', label: 'NFL', icon: Shield, defaultQuery: 'Live NFL Football scores today', image: GiAmericanFootballBall, brandColor: '#013369' },
  { key: 'tennis', label: 'Tennis', icon: Orbit, defaultQuery: 'Live Tennis scores today', image: GiTennisBall, brandColor: '#84CC16' },
  { key: 'f1', label: 'Formula 1', icon: Gauge, defaultQuery: 'Live Formula 1 race standings today', image: GiF1Car, brandColor: '#E10600' },
  { key: 'baseball', label: 'Baseball', icon: Trophy, defaultQuery: 'Live MLB Baseball scores today', image: GiBaseballBat, brandColor: '#B45309' },
  { key: 'hockey', label: 'Hockey', icon: Swords, defaultQuery: 'Live NHL Hockey scores today', image: GiHockey, brandColor: '#0EA5E9' },
  { key: 'esports', label: 'Esports', icon: Gamepad2, defaultQuery: 'Live Esports tournament scores today', image: GiConsoleController, brandColor: '#7C3AED' },
  { key: 'golf', label: 'Golf', icon: Flag, defaultQuery: 'Live PGA Golf leaderboard today', image: GiGolfFlag, brandColor: '#15803D' },
  { key: 'table-tennis', label: 'Table Tennis', icon: CircleDot, defaultQuery: 'Live Table Tennis Ping Pong scores today', image: GiPingPongBat, brandColor: '#DC2626' },
  { key: 'chess', label: 'Chess', icon: Target, defaultQuery: 'Live Chess tournament results today', image: GiChessKnight, brandColor: '#78716C' },
  { key: 'badminton', label: 'Badminton', icon: Orbit, defaultQuery: 'Live Badminton scores today', image: GiShuttlecock, brandColor: '#0284C7' },
  { key: 'boxing', label: 'Boxing', icon: Shield, defaultQuery: 'Live Boxing fight results today', image: GiBoxingGlove, brandColor: '#B91C1C' },
  { key: 'cycling', label: 'Cycling', icon: Gauge, defaultQuery: 'Live Cycling race standings today', image: GiCycling, brandColor: '#F59E0B' },
  { key: 'rugby', label: 'Rugby', icon: Goal, defaultQuery: 'Live Rugby scores today', image: GiRugbyConversion, brandColor: '#065F46' },
  { key: 'volleyball', label: 'Volleyball', icon: CircleDot, defaultQuery: 'Live Volleyball scores today', image: GiVolleyballBall, brandColor: '#EA580C' },
]

export function getSportIcon(key: SportKey): typeof Trophy {
  return SPORTS_CATALOG.find((s) => s.key === key)?.icon ?? HelpCircle
}

export function getSportLabel(key: SportKey): string {
  return SPORTS_CATALOG.find((s) => s.key === key)?.label ?? 'Custom'
}
