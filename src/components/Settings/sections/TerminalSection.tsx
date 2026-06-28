import { SectionGroupHeading } from '../components/SectionGroupHeading'

import { TerminalThemeSetting } from '../components/TerminalThemeSetting'
import { TerminalFontFamilySetting } from '../components/TerminalFontFamilySetting'
import { TerminalFontSizeSetting } from '../components/TerminalFontSizeSetting'
import { TerminalLineHeightSetting } from '../components/TerminalLineHeightSetting'
import { TerminalLetterSpacingSetting } from '../components/TerminalLetterSpacingSetting'
import { TerminalFontWeightSetting } from '../components/TerminalFontWeightSetting'
import { TerminalFontLigaturesSetting } from '../components/TerminalFontLigaturesSetting'
import { TerminalPromptAutoRunSetting } from '../components/TerminalPromptAutoRunSetting'
import { TerminalHistoryAutocompleteSetting } from '../components/TerminalHistoryAutocompleteSetting'

export function TerminalSection(): React.JSX.Element {
  return (
    <>
      <SectionGroupHeading label="Terminal appearance" />
      <TerminalThemeSetting />

      <SectionGroupHeading label="Terminal typography" />
      <TerminalFontFamilySetting />
      <TerminalFontSizeSetting />
      <TerminalLineHeightSetting />
      <TerminalLetterSpacingSetting />
      <TerminalFontWeightSetting />
      <TerminalFontLigaturesSetting />

      <SectionGroupHeading label="Terminal prompts" />
      <TerminalPromptAutoRunSetting />

      <SectionGroupHeading label="Terminal autocomplete" />
      <TerminalHistoryAutocompleteSetting />
    </>
  )
}
