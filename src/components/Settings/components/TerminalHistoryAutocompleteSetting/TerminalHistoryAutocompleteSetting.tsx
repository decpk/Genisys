import { memo } from 'react'

import { Switch } from '@/components/ui/switch'

import { SettingRow } from '../SettingRow'

import { useTerminalHistoryAutocompleteSettingData } from './useTerminalHistoryAutocompleteSettingData'

export const TerminalHistoryAutocompleteSetting = memo(
  function TerminalHistoryAutocompleteSetting(): React.JSX.Element {
    const { value, setValue } = useTerminalHistoryAutocompleteSettingData()
    return (
      <SettingRow
        label="History autocomplete"
        description="As you type at the prompt, suggest matching past commands from your shell history as inline ghost text. Press → or End to accept, Ctrl+Space for a list of matches. Works without configuring your shell."
      >
        <Switch checked={value} onCheckedChange={setValue} />
      </SettingRow>
    )
  },
)
