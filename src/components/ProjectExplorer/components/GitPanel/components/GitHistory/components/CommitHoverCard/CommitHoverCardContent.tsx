import { useCallback, useState } from 'react'
import { GitCommit as CommitIcon, GitBranch, Tag } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatRelativeTime } from '../../../../GitPanel.utils'
import { getInitials, getAvatarColor, parseRefs } from '../CommitItem/CommitItem.utils'
import type { CommitHoverCardContentProps } from './CommitHoverCard.types'

export function CommitHoverCardContent({ commit }: CommitHoverCardContentProps): React.JSX.Element {
  const initials = getInitials(commit.authorName)
  const avatarColor = getAvatarColor(commit.authorName)
  const refs = parseRefs(commit.refs)
  const dateObj = new Date(commit.date)
  const fullDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const fullTime = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  return (
    <div className="w-72 rounded-lg border border-border/50 bg-popover/95 backdrop-blur-sm p-3 shadow-xl text-popover-foreground animate-in fade-in-0 zoom-in-95 duration-150 mr-2">
      {/* Header: Author + Avatar */}
      <div className="flex items-start gap-2.5 mb-2.5">
        <Avatar className="size-8 ring-2 ring-background shrink-0">
          <AvatarFallback
            className="text-[10px] font-bold text-white"
            style={{ backgroundColor: avatarColor }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-foreground truncate">
            {commit.authorName}
          </span>
          <span className="text-[11px] text-muted-foreground truncate">{commit.authorEmail}</span>
        </div>
      </div>

      {/* Commit message */}
      <div className="mb-2.5 px-0.5">
        <p className="text-xs text-foreground leading-relaxed">{commit.message}</p>
      </div>

      {/* Ref badges */}
      {refs.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {refs.map((ref) => (
            <span
              key={ref.name}
              className={cn(
                'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border',
                ref.type === 'head'
                  ? 'bg-primary/15 text-primary border-primary/25'
                  : ref.type === 'tag'
                    ? 'bg-amber-500/15 text-amber-500 border-amber-500/25'
                    : 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25'
              )}
            >
              {ref.type === 'tag' ? (
                <Tag size={9} />
              ) : ref.type === 'branch' ? (
                <GitBranch size={9} />
              ) : (
                <CommitIcon size={9} />
              )}
              {ref.name}
            </span>
          ))}
        </div>
      )}

      {/* Details grid — stacked layout, click anywhere to copy */}
      <div className="flex flex-col gap-1 border-t border-border/30 pt-2.5">
        <CopyableField
          label="Commit"
          value={commit.hash.slice(0, 12)}
          copyValue={commit.hash}
          mono
        />
        <CopyableField label="Author" value={commit.authorName} />
        <CopyableField label="Email" value={commit.authorEmail} />
        <CopyableField
          label="Date"
          value={`${fullDate}\n${fullTime} · ${formatRelativeTime(commit.date)}`}
          copyValue={`${fullDate} ${fullTime}`}
        />
      </div>
    </div>
  )
}

function CopyableField({
  label,
  value,
  copyValue,
  mono
}: {
  label: string
  value: string
  copyValue?: string
  mono?: boolean
}): React.JSX.Element {
  const [copied, setCopied] = useState(false)

  const handleClick = useCallback(() => {
    navigator.clipboard.writeText(copyValue ?? value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }, [value, copyValue])

  const lines = value.split('\n')

  return (
    <button
      onClick={handleClick}
      className="flex flex-col gap-0.5 text-left rounded px-1.5 py-1 -mx-1.5 hover:bg-secondary active:bg-accent transition-colors cursor-pointer"
    >
      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60 leading-none">
        {copied ? "Copied!" : label}
      </span>
      {lines.map((line, i) => (
        <span
          key={i}
          className={cn(
            "text-[11px] leading-tight truncate",
            i === 0 ? "text-foreground" : "text-muted-foreground text-[10px]",
            mono && "text-primary",
          )}
        >
          {line}
        </span>
      ))}
    </button>
  );
}
