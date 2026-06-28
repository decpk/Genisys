import { useMemo } from 'react'
import { Server, FolderPlus } from 'lucide-react'
import type { DropdownItem } from '@/components/ui/dropdown'
import type { SidebarAddMenuProps } from './SidebarAddMenu.types'

export function useSidebarAddMenuData(props: SidebarAddMenuProps) {
  const { onNewServer, onNewProject } = props

  const items: DropdownItem[] = useMemo(
    () => [
      { key: 'server', label: 'New Server', icon: Server, onSelect: onNewServer },
      { key: 'project', label: 'New Project', icon: FolderPlus, onSelect: onNewProject },
    ],
    [onNewServer, onNewProject]
  )

  return { items }
}
