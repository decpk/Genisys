import { SlideFrames } from '@/components/Webpoint/components/SlideFrames'

import { useWebpointStageData } from './useWebpointStageData'
import type { WebpointStageProps } from './WebpointStage.types'

export function WebpointStage(props: WebpointStageProps): React.JSX.Element {
  const { slide } = props
  const frames = useWebpointStageData(slide)

  if (!slide) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        No slide selected
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center overflow-auto bg-muted/20 p-6">
      <div className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-lg border border-border/40 bg-black shadow-lg">
        <SlideFrames {...frames} />
      </div>
    </div>
  )
}
