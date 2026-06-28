import { Play } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { CTA_CLASS, CTA_ICON_SIZE } from './TimerEmptyStateCTA.styles'
import type { TimerEmptyStateCTAProps } from './TimerEmptyStateCTA.types'

export function TimerEmptyStateCTA(props: TimerEmptyStateCTAProps): React.JSX.Element {
  const { label, onActivate } = props
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onActivate}
      className={CTA_CLASS}
    >
      <Play size={CTA_ICON_SIZE} fill="currentColor" />
      {label}
    </Button>
  )
}
