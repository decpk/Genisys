import { Plus } from 'lucide-react'
import { Dropdown } from '@/components/ui/dropdown'
import { Tooltip } from '@/components/Tooltip/Tooltip'
import { useSidebarAddMenuData } from './useSidebarAddMenuData'
import type { SidebarAddMenuProps } from './SidebarAddMenu.types'

export function SidebarAddMenu(props: SidebarAddMenuProps): React.JSX.Element {
  const { items } = useSidebarAddMenuData(props)

  return (
    <Dropdown
      items={items}
      openOn="click"
      align="right"
      menuWidth="180px"
      trigger={
        <Tooltip content="Add" side="bottom">
          <button className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            <Plus size={14} />
          </button>
        </Tooltip>
      }
    />
  )
}
