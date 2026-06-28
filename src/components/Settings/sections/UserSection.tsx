import { ZoomLevelSetting } from '../components/ZoomLevelSetting'
import { FontSizeSetting } from '../components/FontSizeSetting'
import { GlobalFontSetting } from '../components/GlobalFontSetting'
import { PanelLayoutSetting } from '../components/PanelLayoutSetting'
import { RestoreLastAppSetting } from '../components/RestoreLastAppSetting'
import { KeepAliveLimitSetting } from '../components/KeepAliveLimitSetting'
import { ExplainLanguageSetting } from '../components/ExplainLanguageSetting'
import { AutoThemeScheduleSetting } from '../components/AutoThemeScheduleSetting'
import { ShowScrollPercentageSetting } from '../components/ShowScrollPercentageSetting'
import { ShowScrollProgressBarSetting } from '../components/ShowScrollProgressBarSetting'
import { DangerZone } from '../components/DangerZone'
import { HideWhileSearching } from '../components/HideWhileSearching'

export function UserSection(): React.JSX.Element {
  return (
    <>
      <ZoomLevelSetting />
      <FontSizeSetting />
      <GlobalFontSetting />
      <ExplainLanguageSetting />
      <HideWhileSearching>
        <PanelLayoutSetting />
      </HideWhileSearching>
      <RestoreLastAppSetting />
      <KeepAliveLimitSetting />
      <HideWhileSearching>
        <AutoThemeScheduleSetting />
      </HideWhileSearching>
      <ShowScrollProgressBarSetting />
      <ShowScrollPercentageSetting />
      <DangerZone />
    </>
  )
}
