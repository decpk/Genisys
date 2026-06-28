import { ExternalLink, Plus } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'

import type { PromptsAppData } from '../PromptsApp.types'

interface PromptsAppHeroProps {
  data: PromptsAppData
}

export function PromptsAppHero(props: PromptsAppHeroProps): React.JSX.Element {
  const { data } = props
  const {
    activeFolder,
    activeFolderPromptCount,
    activeFolderCategoryCount,
    totalPromptCount,
    totalFolderCount,
    searchQuery,
    filteredPrompts,
    openPromptDialog,
    popOutToNewWindow,
  } = data

  const isSearching = !!searchQuery.trim()

  let eyebrow: string
  let title: string
  let subtitle: string

  if (isSearching) {
    eyebrow = 'Search results'
    title = `“${searchQuery.trim()}”`
    const count = filteredPrompts.length
    subtitle = `${count} ${count === 1 ? 'match' : 'matches'} across your library`
  } else if (activeFolder) {
    eyebrow = 'Collection'
    title = activeFolder.name
    subtitle = `${activeFolderPromptCount} ${activeFolderPromptCount === 1 ? 'prompt' : 'prompts'} · ${activeFolderCategoryCount} ${activeFolderCategoryCount === 1 ? 'category' : 'categories'}`
  } else {
    eyebrow = 'Library'
    title = 'All prompts'
    subtitle = `${totalPromptCount} ${totalPromptCount === 1 ? 'prompt' : 'prompts'} · ${totalFolderCount} ${totalFolderCount === 1 ? 'collection' : 'collections'}`
  }

  return (
    <div className="px-6 pt-6">
      <div className="relative isolate overflow-hidden rounded-2xl border border-border/40 bg-card">
        {/* Soft primary-tinted gradient wash from the top */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b from-primary/[0.07] to-transparent"
        />
        {/* Soft orb behind the title for depth */}
        <span
          aria-hidden
          className="pointer-events-none absolute -left-12 -top-16 -z-10 size-72 rounded-full bg-primary/10 opacity-60 blur-3xl"
        />
        {/* Subtle hairline accent across the top */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        />

        <div className="relative flex items-center gap-5 px-7 py-7">
          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-primary">
              <span aria-hidden className="size-1 rounded-full bg-primary" />
              {eyebrow}
            </p>
            <h1 className="mt-2 truncate text-[26px] font-semibold leading-tight tracking-[-0.015em] text-foreground">
              {title}
            </h1>
            <p className="mt-2 text-[13px] text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                openPromptDialog({
                  folderId: activeFolder?.id,
                })
              }
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-[12.5px] font-medium text-primary-foreground shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.06)_inset] transition-[transform,opacity,box-shadow] hover:-translate-y-px hover:opacity-95 hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.18),0_0_0_1px_rgba(255,255,255,0.08)_inset] cursor-pointer"
            >
              <Plus size={14} strokeWidth={2.5} />
              New prompt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
