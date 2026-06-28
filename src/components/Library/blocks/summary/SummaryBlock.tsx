import type { ReactElement } from 'react'
import { BookOpen } from 'lucide-react'

import type { BlockRenderProps } from '@/frameworks/block-kit'

/**
 * Renders a `<lib-summary>` block — the chapter's recap card. The same block is
 * read (from raw markdown) for cross-chapter continuity during generation.
 */
export function SummaryBlock({ children }: BlockRenderProps): ReactElement {
  return (
    <div className="my-6 rounded-xl border border-border/40 bg-secondary/30 px-5 py-4 scroll-mt-20">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen size={15} className="text-primary/70" />
        <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
          Chapter Summary
        </span>
      </div>
      <div className="text-foreground/80 [&>p]:my-1 [&>ul]:my-1 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
        {children}
      </div>
    </div>
  )
}
