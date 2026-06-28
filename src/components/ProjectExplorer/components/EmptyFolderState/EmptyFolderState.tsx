import { FolderOpen, SearchX } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { EmptyFolderStateProps } from './EmptyFolderState.types'

export function EmptyFolderState(props: EmptyFolderStateProps): React.JSX.Element {
  const { variant, onClearFilters } = props

  let Icon: LucideIcon = FolderOpen
  let title = 'This folder is empty'
  let description = 'There are no files or folders to display here yet.'
  if (variant === 'no-matches') {
    Icon = SearchX
    title = 'No matching files'
    description =
      'No files or folders match your current search and filter settings.'
  }

  const showClearButton = variant === 'no-matches' && !!onClearFilters

  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center py-16 px-6">
      <Icon size={48} className="text-muted-foreground/40 mb-3" />
      <p className="text-sm font-medium text-foreground mb-1">{title}</p>
      <p className="text-xs text-muted-foreground max-w-xs mb-4">{description}</p>
      {showClearButton && (
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  )
}
