import { useMemo } from 'react'

import type { DropdownItem } from '@/components/ui/dropdown'

import { PROMPT_SORT_OPTIONS } from '../../sort'
import type { PromptsAppSortMenuProps } from './PromptsAppSortMenu.types'

interface UsePromptsAppSortMenuDataResult {
  items: DropdownItem[]
  activeLabel: string
}

/**
 * Maps the sort descriptors to dropdown items (flagging the active one)
 * and resolves the active label for the trigger tooltip.
 */
export function usePromptsAppSortMenuData(
  props: PromptsAppSortMenuProps,
): UsePromptsAppSortMenuDataResult {
  const { value, onChange } = props

  const items = useMemo<DropdownItem[]>(
    () =>
      PROMPT_SORT_OPTIONS.map((option) => ({
        key: option.value,
        label: option.label,
        active: option.value === value,
        onSelect: () => onChange(option.value),
      })),
    [value, onChange],
  )

  const activeLabel = useMemo(
    () => PROMPT_SORT_OPTIONS.find((o) => o.value === value)?.label ?? '',
    [value],
  )

  return { items, activeLabel }
}
