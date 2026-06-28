import { memo } from 'react'

import { SettingRow } from '../SettingRow'
import { TypographyStepper } from '../typography/TypographyStepper'

import { useTerminalLetterSpacingSettingData } from './useTerminalLetterSpacingSettingData'
import {
  TERMINAL_LETTER_SPACING_MIN,
  TERMINAL_LETTER_SPACING_MAX,
  TERMINAL_LETTER_SPACING_DEFAULT,
  TERMINAL_LETTER_SPACING_STEP,
  TERMINAL_LETTER_SPACING_DECIMALS,
} from './TerminalLetterSpacingSetting.constants'

const formatLetterSpacing = (v: number): string => `${v.toFixed(1)}px`

export const TerminalLetterSpacingSetting = memo(function TerminalLetterSpacingSetting(): React.JSX.Element {
  const { value, setValue } = useTerminalLetterSpacingSettingData()
  return (
    <SettingRow
      label="Terminal letter spacing"
      description={`Extra horizontal spacing between characters in the terminal. Range: ${TERMINAL_LETTER_SPACING_MIN}–${TERMINAL_LETTER_SPACING_MAX}px.`}
    >
      <TypographyStepper
        value={value}
        onChange={setValue}
        min={TERMINAL_LETTER_SPACING_MIN}
        max={TERMINAL_LETTER_SPACING_MAX}
        step={TERMINAL_LETTER_SPACING_STEP}
        defaultValue={TERMINAL_LETTER_SPACING_DEFAULT}
        decimals={TERMINAL_LETTER_SPACING_DECIMALS}
        format={formatLetterSpacing}
      />
    </SettingRow>
  )
})
