import { DashboardGrid } from './components/DashboardGrid'
import { DashboardHeader } from './components/DashboardHeader'
import { LiveSportsDialog } from './components/LiveSportsTile'
import { SortableTile } from './components/SortableTile'
import { useDashboardData } from './hooks/useDashboardData'
import { resolveTileColSpans } from './resolveTileColSpans'

export function Dashboard(): React.JSX.Element {
  const { registry, handleReorder, headerProps, dialogs } = useDashboardData()

  return (
    <div className="h-full flex flex-col">
      <DashboardHeader {...headerProps} />

      <div className="flex-1 overflow-y-auto p-4">
        <DashboardGrid sortableIds={registry.sortableIds} onReorder={handleReorder}>
          {(cols) => {
            const colSpans = resolveTileColSpans(registry.tiles, cols)
            return registry.tiles.map((tile) => (
              <SortableTile
                key={tile.id}
                id={tile.id}
                tileWidth={tile.width}
                onWidthChange={tile.setWidth}
                colSpanClass={colSpans[tile.id]}
              >
                {tile.render}
              </SortableTile>
            ))
          }}
        </DashboardGrid>
      </div>

      <LiveSportsDialog {...dialogs.liveSports} />
    </div>
  )
}
