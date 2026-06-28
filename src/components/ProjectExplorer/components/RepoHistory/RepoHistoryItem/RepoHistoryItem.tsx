import { HardDrive, X } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import { relativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'

import { repoKey, toRepoInfo } from '../RepoHistory.hooks'
import type { RepoHistoryItemProps } from './RepoHistoryItem.types'

export function RepoHistoryItem(props: RepoHistoryItemProps): React.JSX.Element {
  const { repo, isActive, paneNumbers, hasMultiplePanes, onSelect, onRemove } = props

  const repoInfo = toRepoInfo(repo)
  const key = repoKey(repo)

  const SourceIcon = HardDrive
  const subtitleText = repo.localPath ?? ''
  const tooltipText = `${repo.repository}\n${subtitleText}\nLast opened ${relativeTime(repo.lastOpenedAt)}`

  const rowClass = cn(
    'group flex items-center w-full h-7 px-2 gap-2 rounded-md text-left transition-colors cursor-pointer',
    isActive
      ? 'bg-accent text-foreground font-medium'
      : 'text-foreground hover:bg-muted/40'
  )
  const iconClass = cn('shrink-0 text-primary')
  const removeVariant: 'ghost' | 'destructive' = 'destructive'

  let paneBadges: React.ReactNode = null
  if (isActive && hasMultiplePanes && paneNumbers) {
    paneBadges = paneNumbers.map((num) => (
      <span
        key={num}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/15 text-primary text-[9px] font-bold shrink-0"
      >
        {num}
      </span>
    ))
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRemove(repo)
  }

  const handleSelect = () => {
    onSelect(repoInfo)
  }

  return (
    <button
      key={key}
      type="button"
      onClick={handleSelect}
      title={tooltipText}
      className={rowClass}
    >
      <SourceIcon size={14} className={iconClass} />
      <span className="text-[12px] font-medium truncate flex-1 text-current">
        {repo.repository}
      </span>
      {paneBadges}
      <IconButton
        onClick={handleRemove}
        variant={removeVariant}
        size="xs"
        showOnHover
        tooltip="Remove from history"
      >
        <X size={12} />
      </IconButton>
    </button>
  )
}
