import { memo } from 'react'
import { Switch } from '@/components/ui/switch'
import { SettingRow } from '../SettingRow'
import { useClipboardAddOnceSettingData } from './useClipboardAddOnceSettingData'

export const ClipboardAddOnceSetting = memo(function ClipboardAddOnceSetting(): React.JSX.Element {
  const { clipboardAddOnce, setClipboardAddOnce } = useClipboardAddOnceSettingData()

  return (
    <SettingRow
      label="Deduplicate clipboard entries"
      description="When enabled, copying content that already exists in your clipboard history will move the existing entry to the top instead of creating a duplicate. Labels, pins, and other metadata are preserved."
    >
      <Switch checked={clipboardAddOnce} onCheckedChange={setClipboardAddOnce} />
    </SettingRow>
  )
})
