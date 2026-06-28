import { memo } from 'react'
import { ButtonGroup } from '@/components/ui/button-group'
import type { ClipboardTimelineSortDirection } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'
import { useClipboardTimelineSortSettingData } from './useClipboardTimelineSortSettingData'

const OPTIONS: { value: ClipboardTimelineSortDirection; label: string }[] = [
  { value: 'desc', label: 'Recent first' },
  { value: 'asc', label: 'Oldest first' },
]

export const ClipboardTimelineSortSetting = memo(
  function ClipboardTimelineSortSetting(): React.JSX.Element {
    const { clipboardTimelineSortDirection, setClipboardTimelineSortDirection } =
      useClipboardTimelineSortSettingData()

    return (
      <SettingRow
        label="Timeline sort order"
        description="Controls the order of work sessions and items inside each session in the Clipboard Timeline. Recent first puts the newest activity at the top."
      >
        <ButtonGroup
          options={OPTIONS}
          value={clipboardTimelineSortDirection}
          onChange={setClipboardTimelineSortDirection}
        />
      </SettingRow>
    )
  },
)
