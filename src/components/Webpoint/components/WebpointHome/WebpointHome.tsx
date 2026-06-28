import { Plus, Presentation } from 'lucide-react'

import { PresentationCard } from './components/PresentationCard'
import { useWebpointHomeData } from './useWebpointHomeData'

export function WebpointHome(): React.JSX.Element {
  const { presentations, onCreate, onSelect, onRemove } = useWebpointHomeData()
  const hasPresentations = presentations.length > 0

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/40 px-6">
        <div className="flex items-center gap-2">
          <Presentation className="size-5 text-primary" />
          <h1 className="text-base font-semibold">WebPoint</h1>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          <Plus className="size-4" />
          New presentation
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {!hasPresentations && (
          <div className="flex min-h-[24rem] flex-col items-center justify-center gap-4 text-center">
            <Presentation className="size-10 text-muted-foreground" />
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">No presentations yet</h2>
              <p className="text-sm text-muted-foreground">
                Create your first AI-powered slide deck.
              </p>
            </div>
            <button
              type="button"
              onClick={onCreate}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              New presentation
            </button>
          </div>
        )}
        {hasPresentations && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
            {presentations.map((presentation) => (
              <PresentationCard
                key={presentation.id}
                presentation={presentation}
                onSelect={onSelect}
                onRemove={onRemove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
