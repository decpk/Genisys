import { memo } from 'react'

import { Switch } from '@/components/ui/switch'

import { SettingRow } from '../SettingRow'

import { useTerminalPromptAutoRunSettingData } from './useTerminalPromptAutoRunSettingData'

export const TerminalPromptAutoRunSetting = memo(function TerminalPromptAutoRunSetting(): React.JSX.Element {
  const { value, setValue } = useTerminalPromptAutoRunSettingData()
  return (
    <SettingRow
      label="Auto-run inserted prompts"
      description="When enabled, choosing a prompt from the terminal's Insert prompt menu runs it immediately by sending Enter. Disabled by default so you can review or edit the command before running it."
    >
      <Switch checked={value} onCheckedChange={setValue} />
    </SettingRow>
  )
})
