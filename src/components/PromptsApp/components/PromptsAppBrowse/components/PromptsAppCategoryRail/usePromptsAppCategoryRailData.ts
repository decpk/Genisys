import { useCallback, useState } from 'react'

import { useResizeHandle } from '@/hooks'

import {
  PROMPTS_APP_CATEGORY_RAIL_DEFAULT_WIDTH,
  PROMPTS_APP_CATEGORY_RAIL_MAX_WIDTH,
  PROMPTS_APP_CATEGORY_RAIL_MIN_WIDTH,
} from './PromptsAppCategoryRail.constants'
import { readCategoryRailWidth } from './utils/readCategoryRailWidth'
import { writeCategoryRailWidth } from './utils/writeCategoryRailWidth'

export interface PromptsAppCategoryRailDataReturn {
  width: number
  handleResizeMouseDown: (e: React.MouseEvent) => void
}

/**
 * Owns the resizable width state for `PromptsAppCategoryRail`.
 * Persists the width to localStorage via `writeCategoryRailWidth`.
 *
 * Deliberately does NOT pass `collapseThreshold` to `useResizeHandle`,
 * so the rail can never collapse — the user can only resize between
 * the configured min/max bounds. Double-click the handle to reset to
 * the default width.
 */
export function usePromptsAppCategoryRailData(): PromptsAppCategoryRailDataReturn {
  const [width, setWidth] = useState<number>(() => readCategoryRailWidth())

  const handleWidthChange = useCallback((next: number) => {
    setWidth(next)
    writeCategoryRailWidth(next)
  }, [])

  const { handleMouseDown } = useResizeHandle({
    width,
    minWidth: PROMPTS_APP_CATEGORY_RAIL_MIN_WIDTH,
    maxWidth: PROMPTS_APP_CATEGORY_RAIL_MAX_WIDTH,
    resetWidth: PROMPTS_APP_CATEGORY_RAIL_DEFAULT_WIDTH,
    direction: 'right',
    onWidthChange: handleWidthChange,
  })

  return { width, handleResizeMouseDown: handleMouseDown }
}
