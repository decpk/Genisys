import type { UsageSessionTotals, UsageTotals } from '@/lib/usage'

export interface TotalsCardsProps {
  totals: UsageTotals
  sessionTotals: UsageSessionTotals
}

export interface TotalsCard {
  key: string
  label: string
  value: string
  headline: boolean
}
