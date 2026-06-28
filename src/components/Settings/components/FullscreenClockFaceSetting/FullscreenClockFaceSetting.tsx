import { memo } from 'react'

import { useSettingsStore } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'

import { FACE_OPTIONS } from './FullscreenClockFaceSetting.constants'
import { FaceOption } from './FaceOption'

export const FullscreenClockFaceSetting = memo(function FullscreenClockFaceSetting(): React.JSX.Element {
  const current = useSettingsStore((s) => s.fullscreenClockFace)
  const setFace = useSettingsStore((s) => s.setFullscreenClockFace)

  return (
    <SettingRow
      label="Clock Face"
      description="Pick a visual style for the fullscreen clock."
    >
      <div className="grid grid-cols-3 gap-3 w-[34rem]">
        {FACE_OPTIONS.map((meta) => (
          <FaceOption
            key={meta.value}
            meta={meta}
            isActive={current === meta.value}
            onSelect={setFace}
          />
        ))}
      </div>
    </SettingRow>
  )
})
