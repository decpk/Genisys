import type { IconsOnlyDetectorProps } from './IconsOnlyDetector.types'
import { useIconsOnlyDetectorData } from './useIconsOnlyDetectorData'

export function IconsOnlyDetector({ listRef, onToggle, iconsOnly, children }: IconsOnlyDetectorProps) {
  useIconsOnlyDetectorData(listRef, iconsOnly, onToggle)

  return <>{children}</>
}
