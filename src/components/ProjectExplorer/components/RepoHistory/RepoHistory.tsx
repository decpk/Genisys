import { ChevronDown } from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import { ExplorerShortcuts } from '../ExplorerShortcuts'
import { useRepoHistory } from './RepoHistory.hooks'
import { AddRepoDialog } from './AddRepoDialog'
import { RepoHistoryList } from './RepoHistoryList'
import { SidebarHeaderStrip } from './SidebarHeaderStrip'
import { SidebarSectionHeader } from './SidebarSectionHeader'
import type { RepoHistoryProps } from './RepoHistory.types'

export function RepoHistory(props: RepoHistoryProps): React.JSX.Element {
  const { onSelect, activePanes } = props
  const {
    repos,
    isLoaded,
    clearAll,
    filter,
    setFilter,
    addRepoOpen,
    setAddRepoOpen,
    activeRepoMap,
    hasMultiplePanes,
    pinnedRepos,
    unpinByKey,
  } = useRepoHistory(activePanes)

  const accordionDefault: string[] = []
  if (pinnedRepos.length > 0) accordionDefault.push('pinned')

  const handleAddClick = () => setAddRepoOpen(true)

  const handleUnpin = (entry: { localPath?: string }) => {
    unpinByKey(`local:${entry.localPath ?? ''}`)
  }

  return (
    <>
      <SidebarHeaderStrip
        filter={filter}
        onFilterChange={setFilter}
        onAddClick={handleAddClick}
        onClearAll={clearAll}
        canClearAll={repos.length > 0}
      />

      <AddRepoDialog
        open={addRepoOpen}
        onOpenChange={setAddRepoOpen}
        onSubmit={onSelect}
      />

      <div className="flex-1 overflow-y-auto px-1.5 pb-3">
        <SidebarSectionHeader label="Favorites" />
        <ExplorerShortcuts
          onSelect={onSelect}
          activeRepoMap={activeRepoMap}
          hasMultiplePanes={hasMultiplePanes}
        />

        <Accordion
          type="multiple"
          variant="compact"
          defaultValue={accordionDefault}
        >
          {pinnedRepos.length > 0 && (
            <AccordionItem value="pinned">
              <AccordionTrigger
                hideChevron
                className="group/cat w-full p-0 hover:bg-transparent rounded-none"
              >
                <div className="flex items-center w-full px-2 pt-3 pb-1 select-none">
                  <ChevronDown
                    size={10}
                    className="shrink-0 mr-1 text-muted-foreground/50 transition-transform duration-150 [[data-state=closed]_&]:rotate-[-90deg]"
                  />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70 truncate flex-1 text-left">
                    Pinned
                  </span>
                  <span className="text-[10px] tabular-nums font-medium text-muted-foreground/40">
                    {pinnedRepos.length}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <RepoHistoryList
                  isLoaded={isLoaded}
                  filtered={pinnedRepos}
                  totalCount={pinnedRepos.length}
                  activeRepoMap={activeRepoMap}
                  hasMultiplePanes={hasMultiplePanes}
                  onSelect={onSelect}
                  onRemove={handleUnpin}
                />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </>
  )
}
