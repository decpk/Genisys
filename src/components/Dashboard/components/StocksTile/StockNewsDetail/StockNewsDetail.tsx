import { ArrowLeft, ExternalLink, Sparkles } from 'lucide-react'
import { openUrl } from '@tauri-apps/plugin-opener'

import { Button } from '@/components/ui/button'
import { relativeTime } from '@/lib/format'

import { getDomainFromUrl } from '../utils/getDomainFromUrl'

import type { StockNewsDetailProps } from './StockNewsDetail.types'

export function StockNewsDetail({ item, onBack }: StockNewsDetailProps): React.JSX.Element {
  const domain = item.url ? getDomainFromUrl(item.url) : ''
  const when = item.publishedAt ? relativeTime(item.publishedAt) : null
  const isAi = item.sourceType === 'ai'

  const handleOpen = (): void => {
    if (item.url) openUrl(item.url).catch(() => {})
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border/30 shrink-0">
        <Button variant="ghost" size="xs" onClick={onBack} className="gap-1 px-1.5">
          <ArrowLeft size={12} />
          <span className="text-[11px]">Back</span>
        </Button>
        <div className="ml-auto">
          {item.url && (
            <Button variant="ghost" size="xs" onClick={handleOpen} className="gap-1 px-1.5">
              <ExternalLink size={11} />
              <span className="text-[11px]">Open</span>
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2.5">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70 mb-1.5">
          {isAi && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary/80">
              <Sparkles size={9} />
              AI Summary
            </span>
          )}
          {item.publisher && <span className="truncate">{item.publisher}</span>}
          {item.publisher && domain && <span>·</span>}
          {domain && !item.publisher && <span className="truncate">{domain}</span>}
          {when && <span>· {when}</span>}
        </div>
        <h3 className="text-sm font-semibold text-foreground leading-snug mb-2.5">
          {item.title}
        </h3>
        {item.summary && (
          <div className="text-xs text-foreground/85 leading-relaxed whitespace-pre-wrap mb-3">
            {item.summary}
          </div>
        )}
        {item.whyItMatters && (
          <div className="mt-3 rounded-md border border-border/50 bg-muted/30 px-2.5 py-2">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground/70 mb-1">
              Why it matters
            </div>
            <div className="text-xs text-foreground/85 leading-relaxed whitespace-pre-wrap">
              {item.whyItMatters}
            </div>
          </div>
        )}
        {!item.summary && !item.whyItMatters && (
          <div className="text-xs text-muted-foreground/70 italic">
            No summary available yet. Hit refresh to fetch the latest details.
          </div>
        )}
      </div>
    </div>
  )
}
