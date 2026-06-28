import { memo } from 'react'

import { SettingRow } from '../SettingRow'
import { TypographyFontFamilyPicker } from '../typography/TypographyFontFamilyPicker'

import { useTerminalFontFamilySettingData } from './useTerminalFontFamilySettingData'

export const TerminalFontFamilySetting = memo(function TerminalFontFamilySetting(): React.JSX.Element {
  const { value, setValue } = useTerminalFontFamilySettingData()
  return (
    <SettingRow
      label="Terminal font family"
      description="Monospace font used by the integrated terminal."
    >
      <TypographyFontFamilyPicker value={value} onChange={setValue} />
    </SettingRow>
  )
})
