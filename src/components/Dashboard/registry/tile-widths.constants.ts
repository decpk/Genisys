import { Columns3, Minus, RectangleHorizontal, Square, StretchHorizontal } from 'lucide-react'

import type { TileWidth } from '@/store/dashboard-store'

export interface TileWidthOption {
  value: TileWidth
  label: string
  icon: typeof Square
}

export const TILE_WIDTH_OPTIONS: TileWidthOption[] = [
  { value: 'small', label: '1/6 width', icon: Minus },
  { value: 'third', label: '1/3 width', icon: Columns3 },
  { value: 'half', label: '1/2 width', icon: Square },
  { value: 'full', label: 'Full width', icon: RectangleHorizontal },
  { value: 'fill', label: 'Fill row', icon: StretchHorizontal },
]
