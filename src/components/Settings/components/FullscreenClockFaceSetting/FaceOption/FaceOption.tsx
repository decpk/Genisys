import { memo } from 'react'
import { Check } from 'lucide-react'

import type { FaceOptionProps } from '../FullscreenClockFaceSetting.types'

import { FacePreview } from '../FacePreview'

export const FaceOption = memo(function FaceOption(props: FaceOptionProps): React.JSX.Element {
  const { meta, isActive, onSelect } = props

  const buttonClass = isActive
    ? 'border-primary bg-primary/5'
    : 'border-border hover:border-border/80 hover:bg-secondary/30'

  const badge = !isActive ? null : (
    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
      <Check className="w-3 h-3 text-primary-foreground" />
    </div>
  )

  return (
    <button
      onClick={() => onSelect(meta.value)}
      className={`group relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all cursor-pointer text-left ${buttonClass}`}
    >
      {badge}
      <div className="h-14 w-full rounded-md bg-card/60 border border-border/40 flex items-center justify-center overflow-hidden">
        <FacePreview face={meta.value} />
      </div>
      <div className="w-full">
        <div className="text-xs font-medium text-foreground">{meta.label}</div>
        <div className="text-[0.65rem] text-muted-foreground leading-tight">
          {meta.description}
        </div>
      </div>
    </button>
  )
})
