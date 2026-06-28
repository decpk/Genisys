import type { FacePreviewProps } from '../FullscreenClockFaceSetting.types'

import { getPreviewComponent } from './utils/getPreviewComponent'

export function FacePreview(props: FacePreviewProps): React.JSX.Element {
  const { face } = props
  const PreviewComponent = getPreviewComponent(face)
  return <PreviewComponent />
}
