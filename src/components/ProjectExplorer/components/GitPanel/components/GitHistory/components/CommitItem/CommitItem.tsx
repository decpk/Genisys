import { useCallback } from 'react'
import { GitBranch, Tag, Copy } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/Tooltip'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatRelativeTime } from '../../../../GitPanel.utils'
import { CommitHoverCard } from '../CommitHoverCard'
import { parseRefs, getInitials, getAvatarColor } from './CommitItem.utils'
import type { CommitItemProps } from './CommitItem.types'

export function CommitItem({ commit, isLast = false }: CommitItemProps): React.JSX.Element {
  const shortHash = commit.hash.slice(0, 7)
  const refs = parseRefs(commit.refs)
  const initials = getInitials(commit.authorName)
  const avatarColor = getAvatarColor(commit.authorName)

  const handleCopyHash = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      navigator.clipboard.writeText(commit.hash)
    },
    [commit.hash]
  )

  return (
    <CommitHoverCard commit={commit}>
      <div className="group relative flex gap-2.5 pl-3 pr-3 py-2 hover:bg-secondary transition-colors cursor-default">
        {/* Timeline track */}
        <div className="relative flex flex-col items-center shrink-0 w-5">
          <div
            className={cn(
              "absolute top-0 left-1/2 -translate-x-1/2 w-px bg-border/40",
              "h-full",
            )}
          />
          <div className="relative z-10 mt-1">
            <Avatar className="size-5 ring-2 ring-background">
              <AvatarFallback
                className="text-[7px] font-bold text-white"
                style={{ backgroundColor: avatarColor }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
          {isLast && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-1/2 bg-background z-[1]" />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col min-w-0 flex-1 gap-1">
          {/* Commit message */}
          <span className="text-xs font-medium text-foreground leading-snug line-clamp-2">
            {commit.message}
          </span>

          {/* Ref badges */}
          {refs.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {refs.map((ref) => (
                <span
                  key={ref.name}
                  className={cn(
                    "inline-flex items-center gap-0.5 px-1.5 py-0 rounded-full text-[9px] font-semibold border",
                    ref.type === "head"
                      ? "bg-primary/15 text-primary border-primary/25"
                      : ref.type === "tag"
                        ? "bg-amber-500/15 text-amber-500 border-amber-500/25"
                        : "bg-emerald-500/15 text-emerald-500 border-emerald-500/25",
                  )}
                >
                  {ref.type === "tag" ? (
                    <Tag size={8} />
                  ) : ref.type === "branch" ? (
                    <GitBranch size={8} />
                  ) : null}
                  {ref.name}
                </span>
              ))}
            </div>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70 leading-none">
            <span className="truncate max-w-[100px]">{commit.authorName}</span>
            <span className="text-border">·</span>
            <span className="shrink-0">{formatRelativeTime(commit.date)}</span>
            <span className="text-border">·</span>
            <Tooltip content="Click to copy full hash" side="bottom">
              <button
                onClick={handleCopyHash}
                className="inline-flex items-center gap-0.5 hover:text-foreground transition-colors"
              >
                {shortHash}
                <Copy
                  size={8}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </CommitHoverCard>
  );
}
