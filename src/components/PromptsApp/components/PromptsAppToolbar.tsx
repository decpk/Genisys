import { useMemo } from 'react'
import { FolderPlus, Import, Plus, Tag } from 'lucide-react'

import { Dropdown, type DropdownItem } from '@/components/ui/dropdown'
import { IconButton } from '@/components/ui/icon-button'
import { SearchInput } from '@/components/ui/search-input'

import type { PromptsAppData } from '../PromptsApp.types'
import type { PromptSortOption } from '../sort'

import { PromptsAppSortMenu } from './PromptsAppSortMenu'

interface PromptsAppToolbarProps {
  data: PromptsAppData
  sortOption: PromptSortOption
  onSortChange: (option: PromptSortOption) => void
}

export function PromptsAppToolbar(props: PromptsAppToolbarProps): React.JSX.Element {
  const { data, sortOption, onSortChange } = props
  const {
    searchQuery,
    setSearchQuery,
    activeFolder,
    activeCategoryId,
    openPromptDialog,
    openFolderDialog,
    openCategoryDialog,
    openImportDialog,
  } = data

  const addMenuItems = useMemo<DropdownItem[]>(
    () => [
      {
        key: 'new-prompt',
        label: 'New prompt',
        description: activeFolder
          ? `Add to “${activeFolder.name}”`
          : 'Add to your library',
        icon: Plus,
        onSelect: () =>
          openPromptDialog({
            folderId: activeFolder?.id,
            categoryId: activeCategoryId ?? undefined,
          }),
      },
      {
        key: 'new-category',
        label: 'New category',
        description: activeFolder
          ? `Inside “${activeFolder.name}”`
          : 'Pick a collection first',
        icon: Tag,
        onSelect: () => openCategoryDialog(activeFolder?.id),
      },
      {
        key: 'new-folder',
        label: 'New collection',
        description: 'A new home for a group of prompts',
        icon: FolderPlus,
        onSelect: () => openFolderDialog(),
      },
    ],
    [
      activeFolder,
      activeCategoryId,
      openPromptDialog,
      openCategoryDialog,
      openFolderDialog,
    ],
  )

  return (
    <div className="flex items-center gap-2 px-6 pb-3 pt-5">
      <SearchInput
        placeholder="Search across every collection…"
        value={searchQuery}
        onChange={setSearchQuery}
        className="max-w-md flex-1"
        inputClassName="h-9 text-[12.5px]"
      />
      <div className="flex-1" />
      <PromptsAppSortMenu value={sortOption} onChange={onSortChange} />
      <IconButton
        tooltip="Import shared prompt"
        onClick={openImportDialog}
        variant="outlined"
        size="md"
      >
        <Import size={14} />
      </IconButton>
      <Dropdown
        items={addMenuItems}
        align="right"
        openOn="click"
        menuWidth="w-64"
        trigger={
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-[12.5px] font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-primary/40 cursor-pointer">
            <Plus size={14} strokeWidth={2.5} />
            Add
          </span>
        }
      />
    </div>
  )
}
