import { formatDurationMs } from '../../../utils/formatDurationMs'
import type {
  TotalsCard,
  TotalsCardsProps,
} from '../TotalsCards.types'

/** Builds the ordered stat cards from raw usage totals. */
export function buildTotalsCards(props: TotalsCardsProps): TotalsCard[] {
  const { totals, sessionTotals } = props

  return [
    {
      key: 'foreground',
      label: 'Active time',
      value: formatDurationMs(totals.foregroundMs),
      headline: true,
    },
    {
      key: 'open',
      label: 'Open time',
      value: formatDurationMs(totals.openMs),
      headline: false,
    },
    {
      key: 'sessions',
      label: 'Sessions',
      value: String(totals.totalSessions),
      headline: false,
    },
    {
      key: 'avgSession',
      label: 'Avg session',
      value: formatDurationMs(sessionTotals.avgMs),
      headline: false,
    },
  ]
}
