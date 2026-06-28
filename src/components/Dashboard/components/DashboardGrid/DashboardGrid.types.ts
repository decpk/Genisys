export interface DashboardGridProps {
  sortableIds: string[]
  onReorder: (ids: string[]) => void
  /**
   * Render-prop receiving the number of columns the grid is currently rendering
   * (adapts to available width). Tiles use this to scale their `col-span-*`.
   */
  children: (cols: number) => React.ReactNode
}
