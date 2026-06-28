import { CallControlButton } from '../CallControlButton'
import { callControlsBarStyles as s } from './CallControlsBar.styles'
import type { CallControlsBarProps } from './CallControlsBar.types'
import { useCallControlsBarData } from './useCallControlsBarData'

export function CallControlsBar(props: CallControlsBarProps): React.JSX.Element {
  const { call, handlers } = props
  const { controls } = useCallControlsBarData({ call, handlers })

  return (
    <div className={s.root}>
      {controls.map((control) => (
        <CallControlButton
          key={control.key}
          icon={control.icon}
          active={control.active}
          onClick={control.onClick}
          label={control.label}
          variant={control.variant}
        />
      ))}
    </div>
  )
}
