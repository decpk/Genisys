import { hexToRgba } from '../../../utils/hexToRgba'

import { RING_TRACK_DEFAULT } from '../CircularTimerRing.styles'

export function resolveTrackColor(
  colorRing: string,
  colorTrack: string | undefined,
  tintedTrack: boolean | undefined,
): string {
  if (colorTrack) return colorTrack
  if (tintedTrack) return hexToRgba(colorRing, 0.06)
  return RING_TRACK_DEFAULT
}
