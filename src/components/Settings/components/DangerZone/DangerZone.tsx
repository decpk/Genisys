import { memo } from 'react'
import { useSettingsSearchContext } from '../../settings-search'
import { DeleteAllDataSetting } from '../DeleteAllDataSetting'
import { ResetAllSettingsSetting } from '../ResetAllSettingsSetting'

export const DangerZone = memo(function DangerZone(): React.JSX.Element {
  const { isActive } = useSettingsSearchContext()

  const rows = (
    <>
      <DeleteAllDataSetting />
      <ResetAllSettingsSetting />
    </>
  )

  // While searching, drop the Danger Zone chrome so the rows filter cleanly.
  if (isActive) {
    return <div className="flex flex-col divide-y divide-border/30">{rows}</div>
  }

  return (
    <div className="mt-10 mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-8">
      <h2 className="text-base font-semibold text-destructive mb-1">
        Danger Zone
      </h2>
      <p className="text-xs text-destructive/70 mb-2">
        These actions are irreversible. Please proceed with caution.
      </p>

      <div className="flex flex-col divide-y divide-destructive/20">
        {rows}
      </div>
    </div>
  )
})
