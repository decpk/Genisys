import { memo } from 'react'
import { ButtonGroup } from '@/components/ui/button-group'
import { useSettingsStore } from '@/store/settings-store'
import { CONTENT_WIDTH_OPTIONS } from '../../Settings.constants'
import { SettingRow } from '../SettingRow'

export const LibraryWidthSetting = memo(function LibraryWidthSetting(): React.JSX.Element {
  const libraryContentWidth = useSettingsStore((s) => s.libraryContentWidth)
  const setLibraryContentWidth = useSettingsStore((s) => s.setLibraryContentWidth)

  return (
    <SettingRow
      label="Content width"
      description="Set the default content width for reading chapters in the Library."
    >
      <ButtonGroup
        options={CONTENT_WIDTH_OPTIONS}
        value={libraryContentWidth}
        onChange={setLibraryContentWidth}
      />
    </SettingRow>
  )
})
