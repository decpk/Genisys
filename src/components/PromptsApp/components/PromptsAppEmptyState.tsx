import { FolderPlus, Plus, Sparkles } from 'lucide-react'

interface PromptsAppEmptyStateProps {
  variant: 'no-data' | 'empty-folder' | 'no-search-results'
  onNewPrompt: () => void
  onNewFolder: () => void
  searchQuery?: string
}

export function PromptsAppEmptyState(
  props: PromptsAppEmptyStateProps,
): React.JSX.Element {
  const { variant, onNewPrompt, onNewFolder, searchQuery } = props

  if (variant === 'no-search-results') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="relative mb-5 grid size-16 place-items-center rounded-2xl bg-muted/40">
          <Sparkles size={26} className="text-muted-foreground/70" />
        </div>
        <h3 className="text-base font-semibold text-foreground">No matches</h3>
        <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
          Nothing in your library matches{' '}
          <span className="font-medium text-foreground">
            “{searchQuery}”
          </span>
          . Try a different search term.
        </p>
      </div>
    )
  }

  if (variant === 'empty-folder') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="relative mb-5 grid size-16 place-items-center overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-primary/15" />
          <Plus size={26} className="relative text-primary" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          This collection is empty
        </h3>
        <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
          Add your first prompt to this collection.
        </p>
        <button
          type="button"
          onClick={onNewPrompt}
          className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2 text-[13px] font-medium text-background shadow-sm transition-all hover:opacity-90 cursor-pointer"
        >
          <Plus size={14} />
          New prompt
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <div className="relative mb-7 grid size-24 place-items-center overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-primary opacity-90" />
        <Sparkles size={42} className="relative text-primary-foreground drop-shadow-lg" strokeWidth={1.7} />
        <div className="absolute -inset-4 -z-10 bg-primary/30 blur-3xl" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        Build your prompt library
      </h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Create collections, group prompts into categories, and reuse them across every AI tool in Genisys — one click away from any composer.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={onNewPrompt}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-[13px] font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 cursor-pointer"
        >
          <Plus size={14} />
          New prompt
        </button>
        <button
          type="button"
          onClick={onNewFolder}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-card/60 px-5 py-2.5 text-[13px] font-medium text-foreground backdrop-blur-sm transition-all hover:bg-card cursor-pointer"
        >
          <FolderPlus size={14} />
          New collection
        </button>
      </div>
    </div>
  )
}
