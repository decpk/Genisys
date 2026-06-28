import { memo } from 'react'
import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/store/settings-store'
import { CLIPBOARD_VISION_APP_ID, CLIPBOARD_VISION_DEFAULT_MODEL } from '@/lib/resolveAppModel'
import { SettingRow } from '../components/SettingRow'
import { AppModelSetting } from '../components/AppModelSetting'
import { ClipboardMaxItemsSetting } from '../components/ClipboardMaxItemsSetting'
import { ClipboardAddOnceSetting } from '../components/ClipboardAddOnceSetting'
import { ClipboardSyntaxHighlightSetting } from '../components/ClipboardSyntaxHighlightSetting'
import { ClipboardTimelineSortSetting } from '../components/ClipboardTimelineSortSetting'

export function ClipboardSection(): React.JSX.Element {
  return (
    <>
      <ClipboardMaxItemsSetting />
      <ClipboardAddOnceSetting />
      <ClipboardAutoDescribeSetting />
      <AppModelSetting
        appId={CLIPBOARD_VISION_APP_ID}
        defaultModelId={CLIPBOARD_VISION_DEFAULT_MODEL}
        label="Image analysis model"
        description="Vision model used to describe and extract text from copied images. Must be a vision-capable model. Defaults to GPT-4.1."
      />
      <ClipboardSyntaxHighlightSetting />
      <ClipboardTimelineSortSetting />
    </>
  )
}

const ClipboardAutoDescribeSetting = memo(function ClipboardAutoDescribeSetting(): React.JSX.Element {
  const enabled = useSettingsStore((s) => s.clipboardAutoDescribeImages)
  const setEnabled = useSettingsStore((s) => s.setClipboardAutoDescribeImages)

  return (
    <SettingRow
      label="Auto-describe images with AI"
      description="Automatically generate a text description when an image is copied to the clipboard. This uses a vision model (configurable below) to analyze the image content, enabling natural language search across your clipboard images. Disabling this will skip AI analysis for new images."
    >
      <Switch checked={enabled} onCheckedChange={setEnabled} />
    </SettingRow>
  )
})
