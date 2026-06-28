import { Newspaper } from 'lucide-react'

import { AppLoader } from '@/components/AppLoader'
import type { StockNewsItem } from '@/store/stocks-tile-store'

import { StockNewsCard } from '../StockNewsCard'

export interface StockNewsListProps {
  items: StockNewsItem[]
  isLoading?: boolean
  emptyMessage?: string
  onSelect?: (item: StockNewsItem) => void
}

export function StockNewsList({
  items,
  isLoading = false,
  emptyMessage = 'No headlines yet — hit refresh to fetch the latest.',
  onSelect,
}: StockNewsListProps): React.JSX.Element {
  if (isLoading && items.length === 0) {
    return (
      <div className="h-full flex items-center justify-center py-6">
        <AppLoader />
      </div>
    )
  }
  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-4 text-center py-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2.5">
          <Newspaper size={18} className="text-primary/60" />
        </div>
        <p className="text-xs text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }
  return (
    <div className="flex flex-col divide-y divide-border/30">
      {items.map((it) => (
        <StockNewsCard key={it.id} item={it} onSelect={onSelect} />
      ))}
    </div>
  )
}
