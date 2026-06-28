import { AgendaPill } from './AgendaPill'
import {
  BOTTOM_CONTAINER,
  DISMISS_HINT,
  EMPTY_LINE,
  PILLS_ROW,
  PROGRESS_FILL,
  PROGRESS_TRACK,
  SUMMARY_LINE,
} from './ClockBriefingBottom.styles'
import type { ClockBriefingBottomProps } from './ClockBriefingBottom.types'
import { useClockBriefingBottomData } from './useClockBriefingBottomData'

export function ClockBriefingBottom(props: ClockBriefingBottomProps): React.JSX.Element {
  const { now, chromeOpacity, dismissHint } = props
  const data = useClockBriefingBottomData(now)

  let pillsContent: React.JSX.Element
  if (data.pills.length > 0) {
    pillsContent = (
      <div className={PILLS_ROW}>
        {data.pills.map((pill) => (
          <AgendaPill key={pill.key} pill={pill} />
        ))}
      </div>
    )
  } else {
    pillsContent = <div className={EMPTY_LINE}>{data.emptyLine}</div>
  }

  const progressStyle = { width: `${data.dayPercent}%` }

  return (
    <div className={`${BOTTOM_CONTAINER} ${chromeOpacity}`}>
      {pillsContent}
      <div className={SUMMARY_LINE}>
        <span>{data.summaryLine}</span>
      </div>
      <div className={PROGRESS_TRACK}>
        <div className={PROGRESS_FILL} style={progressStyle} />
      </div>
      <div className={DISMISS_HINT}>{dismissHint}</div>
    </div>
  )
}
