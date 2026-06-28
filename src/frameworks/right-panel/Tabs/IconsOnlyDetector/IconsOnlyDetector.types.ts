import type * as React from 'react'

export interface IconsOnlyDetectorProps {
  listRef: React.RefObject<HTMLDivElement | null>
  onToggle: (v: boolean) => void
  iconsOnly: boolean
  children: React.ReactNode
}
