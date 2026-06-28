import type { FullscreenClockFace } from '@/store/settings-store'

import { MinimalPreview } from '../previews/MinimalPreview'
import { NeonPreview } from '../previews/NeonPreview'
import { FlipPreview } from '../previews/FlipPreview'
import { AnalogPreview } from '../previews/AnalogPreview'
import { AuroraPreview } from '../previews/AuroraPreview'
import { WireframePreview } from '../previews/WireframePreview'
import { RingsPreview } from '../previews/RingsPreview'

const PREVIEW_REGISTRY: Record<FullscreenClockFace, () => React.JSX.Element> = {
  minimal: MinimalPreview,
  neon: NeonPreview,
  flip: FlipPreview,
  analog: AnalogPreview,
  aurora: AuroraPreview,
  wireframe: WireframePreview,
  rings: RingsPreview,
}

export function getPreviewComponent(face: FullscreenClockFace): () => React.JSX.Element {
  return PREVIEW_REGISTRY[face] ?? MinimalPreview
}
