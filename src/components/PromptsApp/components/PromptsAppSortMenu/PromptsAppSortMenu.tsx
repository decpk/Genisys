import { ArrowDownUp } from 'lucide-react'

import { Dropdown } from '@/components/ui/dropdown'
import { IconButton } from '@/components/ui/icon-button'

import type { PromptsAppSortMenuProps } from './PromptsAppSortMenu.types'
import { usePromptsAppSortMenuData } from './usePromptsAppSortMenuData'

/**
 * Sort selector for the Prompts library toolbar. Renders an icon-button
 * trigger that opens a checkmarked dropdown of sort options. The chosen
 * value is owned by the Browse hook (persisted to localStorage there).
 */
export function PromptsAppSortMenu(
  props: PromptsAppSortMenuProps,
): React.JSX.Element {
  const { items, activeLabel } = usePromptsAppSortMenuData(props)

  return (
    <Dropdown
      items={items}
      align="right"
      openOn="click"
      showCheck
      menuWidth="w-52"
      trigger={
        <IconButton
          tooltip={`Sort: ${activeLabel}`}
          variant="outlined"
          size="md"
        >
          <ArrowDownUp size={14} />
        </IconButton>
      }
    />
  )
}
