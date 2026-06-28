import { AlignJustify, Image, LayoutGrid, List, TableProperties } from 'lucide-react'

import type { ViewModeConfig } from './ViewModes.types'

export const VIEW_MODE_CONFIG: ViewModeConfig[] = [
  {
    mode: 'list',
    label: 'List',
    icon: List,
    description: 'Standard single-column list with file icons and names'
  },
  {
    mode: 'grid',
    label: 'Grid',
    icon: LayoutGrid,
    description: 'Fixed-size cards arranged in a responsive grid layout'
  },
  {
    mode: 'detailed',
    label: 'Detailed',
    icon: TableProperties,
    description: 'Table layout showing metadata columns — size, type, and modified date'
  },
  {
    mode: 'compact',
    label: 'Compact',
    icon: AlignJustify,
    description: 'Minimal spacing for maximum density \u2014 fits more items on screen'
  },
  {
    mode: 'thumbnail',
    label: 'Thumbnail',
    icon: Image,
    description: 'Large icon cards with file extension badges for visual browsing'
  }
] as const
