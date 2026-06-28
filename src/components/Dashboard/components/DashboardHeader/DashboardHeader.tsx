import { MoreVertical, LayoutDashboard, Newspaper, Activity, TrendingUp } from 'lucide-react'

import { Dropdown } from '@/components/ui/dropdown'
import type { DropdownGroup } from '@/components/ui/dropdown/Dropdown.types'

import { useTileVisibilityItems } from './visibility'
import type { DashboardHeaderProps } from './DashboardHeader.types'

export function DashboardHeader({
  onAddNews,
  onAddStocks,
  onAddLiveSports,
  newsTileExists,
  stocksTileExists,
}: DashboardHeaderProps): React.JSX.Element {
  const visibilityItems = useTileVisibilityItems()

  const groups: DropdownGroup[] = [
    {
      key: 'actions',
      label: 'Add',
      items: [
        {
          key: 'news',
          label: newsTileExists ? 'News Tile (added)' : 'Add News Tile',
          icon: Newspaper,
          onSelect: newsTileExists ? () => {} : onAddNews,
        },
        {
          key: 'stocks',
          label: stocksTileExists ? 'Stocks Tile (added)' : 'Add Stocks Tile',
          icon: TrendingUp,
          onSelect: stocksTileExists ? () => {} : onAddStocks,
        },
        {
          key: 'live-sports',
          label: 'Track Live Sports',
          icon: Activity,
          onSelect: onAddLiveSports,
        },
      ],
    },
    {
      key: 'visibility',
      label: 'Show / Hide Tiles',
      items: visibilityItems,
    },
  ]

  return (
    <div className="flex items-center justify-between px-4 h-12 border-b border-border/40 bg-card shrink-0">
      <div className="flex items-center gap-2">
        <LayoutDashboard size={18} className="text-primary shrink-0" />
        <h1 className="text-sm font-semibold leading-none translate-y-px">Dashboard</h1>
      </div>
      <div className="flex items-center gap-1">
        <Dropdown
          groups={groups}
          trigger={<MoreVertical size={14} />}
          triggerProps={{ tooltip: 'Menu', tooltipSide: 'bottom', size: 'xs' }}
          openOn="click"
          menuWidth="240px"
        />
      </div>
    </div>
  )
}
