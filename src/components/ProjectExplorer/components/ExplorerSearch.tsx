import { useEffect, useDeferredValue, useMemo, useState } from 'react'
import { GitBranch, SlidersHorizontal } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import { SearchInput } from '@/components/ui/search-input'
import { ExplorerSearchFilters } from './ExplorerSearchFilters'
import type {
  ExplorerSearchProps,
  ItemTypeFilter,
  GitObjectTypeFilter
} from './ExplorerSearch.types'

export function ExplorerSearch({
  items,
  onFilteredItemsChange,
  isGitRepo,
  gitPanelOpen,
  onToggleGitPanel,
  onClearFiltersReady
}: ExplorerSearchProps): React.JSX.Element {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const [showFilters, setShowFilters] = useState(false)
  const [itemType, setItemType] = useState<ItemTypeFilter>('All')
  const [gitObjectType, setGitObjectType] = useState<GitObjectTypeFilter>('All')
  const [extensions, setExtensions] = useState('')

  useEffect(() => {
    if (!onClearFiltersReady) return
    onClearFiltersReady(() => {
      setQuery('')
      setItemType('All')
      setGitObjectType('All')
      setExtensions('')
    })
  }, [onClearFiltersReady])

  const filtered = useMemo(() => {
    const q = deferredQuery.toLowerCase()
    const extList = extensions
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
      .map((e) => (e.startsWith('.') ? e : `.${e}`))

    return items.filter((item) => {
      const name = item.path.split('/').pop()?.toLowerCase() ?? ''
      if (q && !name.includes(q)) return false
      if (itemType === 'Files only' && item.isFolder) return false
      if (itemType === 'Folders only' && !item.isFolder) return false
      if (gitObjectType !== 'All' && item.gitObjectType !== gitObjectType) return false
      if (extList.length > 0 && !item.isFolder && !extList.some((ext) => name.endsWith(ext)))
        return false
      return true
    })
  }, [items, deferredQuery, itemType, gitObjectType, extensions])

  useEffect(() => {
    onFilteredItemsChange(filtered)
  }, [filtered, onFilteredItemsChange])

  const hasActiveFilters = itemType !== 'All' || gitObjectType !== 'All' || extensions !== ''

  return (
    <div className="border-b border-border/20">
      <div className="flex items-center gap-1.5 px-3 py-1.5">
        <SearchInput
          placeholder="Search files and folders…"
          value={query}
          onChange={setQuery}
          className="flex-1"
          inputClassName="h-8"
        />
        <IconButton
          tooltip="Toggle filters"
          onClick={() => setShowFilters((v) => !v)}
          className={showFilters || hasActiveFilters ? 'bg-primary/15 text-primary' : ''}
        >
          <SlidersHorizontal size={14} />
        </IconButton>
        {isGitRepo && onToggleGitPanel && (
          <IconButton
            tooltip={gitPanelOpen ? 'Close git panel' : 'Open git panel'}
            onClick={onToggleGitPanel}
            className={gitPanelOpen ? 'bg-primary/15 text-primary' : ''}
          >
            <GitBranch size={14} />
          </IconButton>
        )}
      </div>

      {showFilters && (
        <ExplorerSearchFilters
          itemType={itemType}
          gitObjectType={gitObjectType}
          extensions={extensions}
          onItemTypeChange={setItemType}
          onGitObjectTypeChange={setGitObjectType}
          onExtensionsChange={setExtensions}
        />
      )}
    </div>
  )
}
