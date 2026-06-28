import { memo } from 'react'

import { SettingRow } from '../SettingRow'
import { PanelConfigRow } from './PanelConfigRow'
import { panelToolsStyles as s } from './AiPanelToolsSetting.styles'
import { useAiPanelToolsSettingData } from './useAiPanelToolsSettingData'

export const AiPanelToolsSetting = memo(function AiPanelToolsSetting(): React.JSX.Element {
  const { configs, chatModel, handleConfigChange } = useAiPanelToolsSettingData()

  return (
    <SettingRow
      label="Per-panel tool & model configuration"
      description="Configure which AI model and tools each panel uses. Disable tools for panels that don't need them to avoid API limits."
    >
      <div className={s.root}>
        {configs.map((entry) => (
          <PanelConfigRow
            key={entry.id}
            appId={entry.id}
            appLabel={entry.label}
            config={entry.config}
            chatModel={chatModel}
            onConfigChange={handleConfigChange}
          />
        ))}
      </div>
    </SettingRow>
  )
})
