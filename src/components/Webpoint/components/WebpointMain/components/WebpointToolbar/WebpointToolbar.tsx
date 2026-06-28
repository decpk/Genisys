import { ChevronLeft, Download, PanelRight, Pencil, Play, Presentation, Sparkles } from 'lucide-react'

import { downloadPresentationHtml } from '@/components/Webpoint/export/downloadPresentationHtml'
import { cn } from '@/lib/utils'
import { useWebpointAIStore } from '@/store/webpoint-ai-store'
import { useWebpointStore } from '@/store/webpoint-store'

import type { WebpointToolbarProps } from './WebpointToolbar.types'

export function WebpointToolbar(props: WebpointToolbarProps): React.JSX.Element {
  const { title, mode, onBack, onModeChange } = props
  const panelOpen = useWebpointAIStore((s) => s.panelOpen)
  const togglePanel = useWebpointAIStore((s) => s.togglePanel)
  const inspectorOpen = useWebpointAIStore((s) => s.inspectorOpen)
  const toggleInspector = useWebpointAIStore((s) => s.toggleInspector)
  const startPresenting = useWebpointAIStore((s) => s.startPresenting)
  const activePresentation = useWebpointStore((s) => s.activePresentation)

  const onExport = (): void => {
    void downloadPresentationHtml(activePresentation)
  }

  return (
    <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border/40 px-3">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to presentations"
          className="rounded-md p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="truncate text-sm font-medium">{title}</span>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <div className="flex items-center gap-0.5 rounded-md border border-border/60 p-0.5">
          <button
            type="button"
            onClick={() => onModeChange('edit')}
            className={cn(
              'flex items-center gap-1 rounded px-2 py-1 text-xs transition',
              mode === 'edit' && 'bg-accent text-foreground',
              mode !== 'edit' && 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Pencil className="size-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onModeChange('preview')}
            className={cn(
              'flex items-center gap-1 rounded px-2 py-1 text-xs transition',
              mode === 'preview' && 'bg-accent text-foreground',
              mode !== 'preview' && 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Play className="size-3.5" />
            Preview
          </button>
        </div>
        <button
          type="button"
          onClick={startPresenting}
          className="flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          <Presentation className="size-3.5" />
          Present
        </button>
        <button
          type="button"
          onClick={onExport}
          aria-label="Export as HTML"
          className="rounded-md p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <Download className="size-4" />
        </button>
        <button
          type="button"
          onClick={toggleInspector}
          aria-label="Toggle inspector"
          className={cn(
            'rounded-md p-1.5 transition',
            inspectorOpen && 'bg-primary/10 text-primary',
            !inspectorOpen && 'text-muted-foreground hover:bg-accent hover:text-foreground'
          )}
        >
          <PanelRight className="size-4" />
        </button>
        <button
          type="button"
          onClick={togglePanel}
          aria-label="Toggle AI assistant"
          className={cn(
            'rounded-md p-1.5 transition',
            panelOpen && 'bg-primary/10 text-primary',
            !panelOpen && 'text-muted-foreground hover:bg-accent hover:text-foreground'
          )}
        >
          <Sparkles className="size-4" />
        </button>
      </div>
    </div>
  )
}
