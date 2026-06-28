export interface SidebarHeaderStripProps {
  filter: string
  onFilterChange: (value: string) => void
  onAddClick: () => void
  onClearAll: () => void
  canClearAll: boolean
}
