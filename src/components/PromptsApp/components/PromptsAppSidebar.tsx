import { useMemo } from 'react'
import { LayoutGrid, Sparkles } from 'lucide-react'

import { SearchInput } from '@/components/ui/search-input'
import { cn } from '@/lib/utils'

import { PromptsAppSidebarFolderRow } from './PromptsAppSidebarFolderRow'
import { PromptsAppSidebarFooter } from './PromptsAppSidebarFooter'
import type { PromptsAppData } from '../PromptsApp.types'

interface PromptsAppSidebarProps {
  data: PromptsAppData
}

export function PromptsAppSidebar(props: PromptsAppSidebarProps): React.JSX.Element {
  const { data } = props
  const {
    folders,
    activeFolderId,
    folderPromptCounts,
    totalPromptCount,
    searchQuery,
    setSearchQuery,
    setActiveFolderId,
    openFolderDialog,
    openImportDialog,
    removeFolder,
  } = data

  const sortedFolders = useMemo(
    () => [...folders].sort((a, b) => a.sortOrder - b.sortOrder),
    [folders],
  )

  const isAllActive = activeFolderId === null && !searchQuery.trim()

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-card/50 backdrop-blur-md">
      {/* Decorative primary halo behind header */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 size-64 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
      />

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="px-4 pb-3 pt-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
          Library
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
          Prompts
        </h2>
      </div>

      {/* ── Search ─────────────────────────────────────────── */}
      <div className="px-3 pb-2">
        <SearchInput
          placeholder="Search prompts…"
          value={searchQuery}
          onChange={setSearchQuery}
          inputClassName="h-9 text-[12.5px]"
        />
      </div>

      {/* ── All prompts ────────────────────────────────────── */}
      <div className="px-3 pb-2 pt-1">
        <button
          type="button"
          onClick={() => setActiveFolderId(null)}
          className={cn(
            'group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all cursor-pointer border',
            isAllActive
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'border-transparent text-foreground hover:bg-muted/40',
          )}
        >
          <span
            className={cn(
              'grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm',
              isAllActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100',
            )}
          >
            <Sparkles size={13} strokeWidth={2.5} />
          </span>
          <span className="flex-1 truncate text-[13px] font-semibold leading-tight">
            All prompts
          </span>
          <span className="shrink-0 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
            {totalPromptCount}
          </span>
        </button>
      </div>

      {/* ── Collections label ──────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pb-1.5 pt-2">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
          Collections
        </p>
        <span className="text-[10px] tabular-nums text-muted-foreground/50">
          {sortedFolders.length}
        </span>
      </div>

      {/* ── Folder list ────────────────────────────────────── */}
      <div className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-3">
        {sortedFolders.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-3 py-6 text-center">
            <div className="grid size-9 place-items-center rounded-xl bg-muted/40 text-muted-foreground/70">
              <LayoutGrid size={15} />
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground/70">
              No collections yet.
              <br />
              Create one to start grouping your prompts.
            </p>
          </div>
        ) : (
          sortedFolders.map((folder) => (
            <PromptsAppSidebarFolderRow
              key={folder.id}
              folder={folder}
              isActive={activeFolderId === folder.id}
              count={folderPromptCounts[folder.id] ?? 0}
              onSelect={setActiveFolderId}
              onEdit={openFolderDialog}
              onDelete={removeFolder}
            />
          ))
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <PromptsAppSidebarFooter
        onNewFolder={() => openFolderDialog()}
        onImport={openImportDialog}
      />
    </div>
  )
}
