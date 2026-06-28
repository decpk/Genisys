import { TOP_CONTAINER, TOP_EYEBROW, TOP_QUOTE } from './ClockBriefingTop.styles'
import type { ClockBriefingTopProps } from './ClockBriefingTop.types'
import { useClockBriefingTopData } from './useClockBriefingTopData'

export function ClockBriefingTop(props: ClockBriefingTopProps): React.JSX.Element {
  const { now, isVisible, chromeOpacity } = props
  const { quote, eyebrowLabel } = useClockBriefingTopData(now, isVisible)
  const framedQuote = `\u201C${quote}\u201D`

  return (
    <div className={`${TOP_CONTAINER} ${chromeOpacity}`}>
      <div className={TOP_EYEBROW}>{eyebrowLabel}</div>
      <div className={TOP_QUOTE}>{framedQuote}</div>
    </div>
  )
}
