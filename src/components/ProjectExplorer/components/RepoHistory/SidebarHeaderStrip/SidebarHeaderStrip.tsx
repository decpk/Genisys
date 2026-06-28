import { MoreHorizontal, Plus, Trash2 } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import { SearchInput } from '@/components/ui/search-input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useSidebarHeaderStripData } from './useSidebarHeaderStripData'
import type { SidebarHeaderStripProps } from './SidebarHeaderStrip.types'

export function SidebarHeaderStrip(
  props: SidebarHeaderStripProps
): React.JSX.Element {
  const { filter, canClearAll } = props
  const { handleAddClick, handleClearAll, handleFilterChange } =
    useSidebarHeaderStripData(props)

  let clearItem: React.ReactNode = null
  if (canClearAll) {
    clearItem = (
      <DropdownMenuItem
        onSelect={handleClearAll}
        className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] cursor-pointer outline-none transition-colors text-destructive hover:bg-destructive/10"
      >
        <Trash2 size={13} className="shrink-0" />
        <span>Clear history</span>
      </DropdownMenuItem>
    )
  }

  return (
    <div className="flex items-center gap-1.5 px-2 h-10 shrink-0">
      <SearchInput
        placeholder="Search…"
        value={filter}
        onChange={handleFilterChange}
        className="flex-1"
        inputClassName="h-7 rounded-md bg-muted/40 border-transparent focus-visible:bg-background"
      />
      <IconButton size="sm" onClick={handleAddClick} tooltip="Add repository">
        <Plus size={14} />
      </IconButton>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton size="sm" tooltip="Sidebar options">
            <MoreHorizontal size={14} />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={6}
          className="z-50 min-w-[160px] rounded-lg border border-border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95"
        >
          {clearItem}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
