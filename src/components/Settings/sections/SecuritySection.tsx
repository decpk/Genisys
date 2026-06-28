import { SecurityToggleSetting } from '../components/SecurityToggleSetting/SecurityToggleSetting'
import { SecurityTypeSetting } from '../components/SecurityTypeSetting/SecurityTypeSetting'
import { SetPasswordSetting } from '../components/SetPasswordSetting/SetPasswordSetting'
import { LockTimeoutSetting } from '../components/LockTimeoutSetting/LockTimeoutSetting'
import { LockOnFocusLossSetting } from '../components/LockOnFocusLossSetting/LockOnFocusLossSetting'
import { LockOnLaunchSetting } from '../components/LockOnLaunchSetting/LockOnLaunchSetting'
import { MaxFailedAttemptsSetting } from '../components/MaxFailedAttemptsSetting/MaxFailedAttemptsSetting'
import { LockNowSetting } from '../components/LockNowSetting/LockNowSetting'
import { PreventScreenCaptureSetting } from '../components/PreventScreenCaptureSetting/PreventScreenCaptureSetting'

export function SecuritySection(): React.JSX.Element {
  return (
    <>
      <PreventScreenCaptureSetting />
      <SecurityToggleSetting />
      <SecurityTypeSetting />
      <SetPasswordSetting />
      <LockTimeoutSetting />
      <LockOnFocusLossSetting />
      <LockOnLaunchSetting />
      <MaxFailedAttemptsSetting />
      <LockNowSetting />
    </>
  )
}
