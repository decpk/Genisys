import { ExternalLink, Sparkles } from 'lucide-react'
import { openUrl } from '@tauri-apps/plugin-opener'

import type { StockNewsItem } from '@/store/stocks-tile-store'
import { relativeTime } from '@/lib/format'

import { getDomainFromUrl } from '../utils/getDomainFromUrl'

export interface StockNewsCardProps {
  item: StockNewsItem
  onSelect?: (item: StockNewsItem) => void
}

export function StockNewsCard({ item, onSelect }: StockNewsCardProps): React.JSX.Element {
  const domain = item.url ? getDomainFromUrl(item.url) : ''
  const when = item.publishedAt ? relativeTime(item.publishedAt) : null

  const handleClick = (): void => {
    if (onSelect) {
      onSelect(item)
      return
    }
    if (item.url) openUrl(item.url).catch(() => {})
  }

  return (
    <div
      onClick={handleClick}
      className="group/row flex items-start gap-2.5 px-3 py-2 hover:bg-accent/30 transition-colors duration-150 cursor-pointer"
    >
      <div className="w-5 h-5 mt-0.5 rounded bg-primary/10 flex items-center justify-center shrink-0">
        {item.sourceType === 'ai' ? (
          <Sparkles size={11} className="text-primary/70" />
        ) : (
          <ExternalLink size={11} className="text-primary/70" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug">
          {item.title}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
          {item.publisher && <span className="truncate">{item.publisher}</span>}
          {item.publisher && domain && <span>·</span>}
          {domain && !item.publisher && <span className="truncate">{domain}</span>}
          {when && <span>· {when}</span>}
        </div>
      </div>
    </div>
  )
}
