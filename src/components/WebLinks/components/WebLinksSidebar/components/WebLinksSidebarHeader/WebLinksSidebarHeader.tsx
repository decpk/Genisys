import { useMemo } from 'react'
import { Download, FolderPlus, Link2, Plus, ScanLine } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import { Dropdown } from '@/components/ui/dropdown'
import type { DropdownItem } from '@/components/ui/dropdown'

import type { WebLinksSidebarHeaderProps } from './WebLinksSidebarHeader.types'
import { STYLES } from './WebLinksSidebarHeader.styles'

/** Sidebar header: the "Collections" title plus its import / add actions. */
export function WebLinksSidebarHeader(props: WebLinksSidebarHeaderProps): React.JSX.Element {
  const { onOpenScreenshotImport, onOpenBookmarkImport, onOpenAddLink, onOpenNewFolder } = props

  const addMenuItems: DropdownItem[] = useMemo(
    () => [
      { key: 'link', label: 'Add a link', icon: Link2, onSelect: onOpenAddLink },
      { key: 'folder', label: 'Add folder', icon: FolderPlus, onSelect: onOpenNewFolder },
    ],
    [onOpenAddLink, onOpenNewFolder],
  )

  return (
    <div className={STYLES.header}>
      <span className={STYLES.title}>Collections</span>
      <div className={STYLES.headerActions}>
        <IconButton
          type="button"
          size="sm"
          variant="ghost"
          tooltip="Scan screenshot for URLs"
          onClick={onOpenScreenshotImport}
        >
          <ScanLine size={13} />
        </IconButton>
        <IconButton
          type="button"
          size="sm"
          variant="ghost"
          tooltip="Import bookmarks"
          onClick={onOpenBookmarkImport}
        >
          <Download size={13} />
        </IconButton>
        <Dropdown
          items={addMenuItems}
          openOn="click"
          align="right"
          menuWidth="180px"
          trigger={<Plus size={13} />}
          triggerProps={{ type: 'button', size: 'sm', variant: 'ghost', tooltip: 'Add' }}
        />
      </div>
    </div>
  )
}
