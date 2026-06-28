import { memo } from 'react'

import { ButtonGroup } from '@/components/ui/button-group'
import { useSettingsStore } from '@/store/settings-store'

import { LIBRARY_INLINE_IMAGE_SIZE_OPTIONS } from '../../Settings.constants'
import { SettingRow } from '../SettingRow'

export const LibraryInlineImageSizeSetting = memo(function LibraryInlineImageSizeSetting(): React.JSX.Element {
  const libraryInlineImageSize = useSettingsStore((s) => s.libraryInlineImageSize)
  const setLibraryInlineImageSize = useSettingsStore((s) => s.setLibraryInlineImageSize)

  return (
    <SettingRow
      label="Inline image size"
      description="Set the default width for inline chapter images in the Library. Images remain clickable for full-screen viewing."
    >
      <ButtonGroup
        options={LIBRARY_INLINE_IMAGE_SIZE_OPTIONS}
        value={libraryInlineImageSize}
        onChange={setLibraryInlineImageSize}
      />
    </SettingRow>
  )
})