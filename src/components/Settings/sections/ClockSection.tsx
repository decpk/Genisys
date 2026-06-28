import { FullscreenClockTimeoutSetting } from '../components/FullscreenClockTimeoutSetting'
import { FullscreenClockPressAndHoldSetting } from '../components/FullscreenClockPressAndHoldSetting'
import { FullscreenClockFaceSetting } from '../components/FullscreenClockFaceSetting'

export function ClockSection(): React.JSX.Element {
  return (
    <>
      <FullscreenClockTimeoutSetting />
      <FullscreenClockPressAndHoldSetting />
      <FullscreenClockFaceSetting />
    </>
  )
}
