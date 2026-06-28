import { ArrowLeft, ArrowRight, Globe } from 'lucide-react'

import type { CrawlNavLinks } from '../../hooks/useChatStream'

interface CrawlNavFooterProps {
  navLinks: CrawlNavLinks
  onNavigate: (url: string) => void
}

export function CrawlNavFooter({ navLinks, onNavigate }: CrawlNavFooterProps): React.JSX.Element | null {
  const { prev, next } = navLinks
  if (!prev && !next) return null

  return (
    <div className="mt-0">
      {/* Separator */}
      <div className="border-t border-border/40 mx-1" />

      {/* Navigation cards */}
      <div className="flex items-stretch gap-3 pt-3 px-1 pb-1">
        {/* Previous */}
        {prev ? (
          <button
            onClick={() => onNavigate(prev.href)}
            className="group/nav flex-1 flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all cursor-pointer
              bg-muted/30 hover:bg-muted/60 border border-border/30 hover:border-border/60"
          >
            <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover/nav:bg-primary/20 transition-colors">
              <ArrowLeft size={14} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
                Previous
              </span>
              <span className="block text-xs text-foreground truncate group-hover/nav:text-primary transition-colors">
                {prev.text}
              </span>
            </div>
          </button>
        ) : (
          <div className="flex-1" />
        )}

        {/* Next */}
        {next ? (
          <button
            onClick={() => onNavigate(next.href)}
            className="group/nav flex-1 flex items-center gap-3 rounded-xl px-4 py-3 text-right transition-all cursor-pointer
              bg-muted/30 hover:bg-muted/60 border border-border/30 hover:border-border/60"
          >
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
                Next
              </span>
              <span className="block text-xs text-foreground truncate group-hover/nav:text-primary transition-colors">
                {next.text}
              </span>
            </div>
            <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover/nav:bg-primary/20 transition-colors">
              <ArrowRight size={14} className="text-primary" />
            </div>
          </button>
        ) : (
          <div className="flex-1" />
        )}
      </div>

      {/* Subtle hint */}
      <div className="flex items-center justify-center gap-1 pt-1 pb-0.5">
        <Globe size={9} className="text-muted-foreground/40" />
        <span className="text-[9px] text-muted-foreground/40">Click to crawl & analyze</span>
      </div>
    </div>
  )
}
