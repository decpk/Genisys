import { useMemo } from 'react'
import { Plus, FileText, FolderPlus } from 'lucide-react'
import { Dropdown } from '@/components/ui/dropdown'
import type { DropdownItem } from '@/components/ui/dropdown'
import { Tooltip } from '@/components/Tooltip/Tooltip'
import type { CollectionsPanelAddMenuProps } from './CollectionsPanelAddMenu.types'

export function CollectionsPanelAddMenu(props: CollectionsPanelAddMenuProps): React.JSX.Element {
  const { onNewRequest, onNewCollection } = props

  const items: DropdownItem[] = useMemo(
    () => [
      { key: 'request', label: 'New Request', icon: FileText, onSelect: onNewRequest },
      { key: 'collection', label: 'New Collection', icon: FolderPlus, onSelect: onNewCollection },
    ],
    [onNewRequest, onNewCollection],
  )

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
