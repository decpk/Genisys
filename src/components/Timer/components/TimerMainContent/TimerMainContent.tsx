import { Maximize2 } from 'lucide-react'

import { CompactView } from './components/CompactView'
import { FocusView } from './components/FocusView'
import { GridView } from './components/GridView'
import { ViewModeTabs } from './components/ViewModeTabs'
import type { TimerView } from './TimerMainContent.types'
import { useTimerMainContentData } from './useTimerMainContentData'

interface ViewRendererProps {
  view: TimerView
  primary: ReturnType<typeof useTimerMainContentData>['primary']
  instances: ReturnType<typeof useTimerMainContentData>['instances']
}

function ViewRenderer(props: ViewRendererProps): React.JSX.Element {
  const { view, primary, instances } = props
  if (view === 'focus') return <FocusView primary={primary} />
  if (view === 'grid') return <GridView instances={instances} />
  return <CompactView instances={instances} />
}

function handleOpenMini(): void {
  const api = (window as unknown as {
    api?: { openTimerFocusWindow?: () => Promise<unknown> }
  }).api
  if (api?.openTimerFocusWindow) void api.openTimerFocusWindow()
}

export function TimerMainContent(): React.JSX.Element {
  const { primary, instances, view, setView } = useTimerMainContentData()

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-2">
        <div className="text-sm font-medium">Timer</div>
        <ViewModeTabs value={view} onChange={setView} />
        <button
          type="button"
          onClick={handleOpenMini}
          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          title="Open mini focus window"
        >
          <Maximize2 size={12} />
          Mini
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <ViewRenderer view={view} primary={primary} instances={instances} />
      </div>
    </div>
  )
}
