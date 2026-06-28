import { CompactRowControls } from './components/CompactRowControls'
import { CompactRowMiniRing } from './components/CompactRowMiniRing'
import {
  COMPACT_BODY_CLASS,
  COMPACT_FILL_CLASS,
  COMPACT_MODE_CLASS,
  COMPACT_NAME_CLASS,
  COMPACT_PHASE_CLASS,
  COMPACT_ROOT_CLASS,
  COMPACT_TIME_CLASS,
  COMPACT_TITLE_ROW_CLASS,
  COMPACT_TRACK_CLASS,
} from './CompactRow.styles'
import type { CompactRowProps } from './CompactRow.types'
import { buildCompactProgressStyle } from './utils/buildCompactProgressStyle'
import { buildCompactRowStyle } from './utils/buildCompactRowStyle'
import { getCompactPhaseLabel } from './utils/getCompactPhaseLabel'
import { getCompactProgressWidth } from './utils/getCompactProgressWidth'

function stopPropagation(event: React.MouseEvent): void {
  event.stopPropagation()
}

export function CompactRow(props: CompactRowProps): React.JSX.Element {
  const {
    instance,
    ringColor,
    progress,
    centerLabel,
    isRunning,
    isPrimary,
    onStart,
    onPause,
    onReset,
    onSkip,
    onRemove,
    onPromote,
  } = props

  const phaseLabel = getCompactPhaseLabel(instance.phase)
  const widthPct = getCompactProgressWidth(progress)
  const fillStyle = buildCompactProgressStyle(ringColor, widthPct)
  const rowStyle = buildCompactRowStyle(ringColor, isPrimary)

  const handleClick = (): void => {
    if (isPrimary) return
    onPromote()
  }

  return (
    <div
      className={COMPACT_ROOT_CLASS}
      style={rowStyle}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <CompactRowMiniRing color={ringColor} progress={progress} isRunning={isRunning} />

      <div className={COMPACT_BODY_CLASS}>
        <div className={COMPACT_TITLE_ROW_CLASS}>
          <span className={COMPACT_NAME_CLASS}>{instance.name}</span>
          <span className={COMPACT_MODE_CLASS}>{instance.mode}</span>
          <span className={COMPACT_PHASE_CLASS}>{phaseLabel}</span>
        </div>
        <div className={COMPACT_TRACK_CLASS}>
          <div className={COMPACT_FILL_CLASS} style={fillStyle} />
        </div>
      </div>

      <div className={COMPACT_TIME_CLASS}>{centerLabel}</div>

      <div onClick={stopPropagation}>
        <CompactRowControls
          isRunning={isRunning}
          onStart={onStart}
          onPause={onPause}
          onReset={onReset}
          onSkip={onSkip}
          onRemove={onRemove}
          accentColor={ringColor}
        />
      </div>
    </div>
  )
}
