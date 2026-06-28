import type { FullscreenClockFace } from '@/store/settings-store'
import type { FaceProps } from '../FullscreenClock.types'

import { MinimalFace } from '../faces/MinimalFace'
import { NeonFace } from '../faces/NeonFace'
import { FlipFace } from '../faces/FlipFace'
import { AnalogFace } from '../faces/AnalogFace'
import { AuroraFace } from '../faces/AuroraFace'
import { WireframeFace } from '../faces/WireframeFace'
import { RingsFace } from '../faces/RingsFace'

const FACE_REGISTRY: Record<FullscreenClockFace, (props: FaceProps) => React.JSX.Element> = {
  minimal: MinimalFace,
  neon: NeonFace,
  flip: FlipFace,
  analog: AnalogFace,
  aurora: AuroraFace,
  wireframe: WireframeFace,
  rings: RingsFace,
}

export function getFaceComponent(
  face: FullscreenClockFace,
): (props: FaceProps) => React.JSX.Element {
  return FACE_REGISTRY[face] ?? MinimalFace
}
