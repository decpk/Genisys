import { memo } from 'react'
import { Switch } from '@/components/ui/switch'
import { SettingRow } from '../SettingRow'
import { useClipboardSyntaxHighlightSettingData } from './useClipboardSyntaxHighlightSettingData'

export const ClipboardSyntaxHighlightSetting = memo(function ClipboardSyntaxHighlightSetting(): React.JSX.Element {
  const { clipboardSyntaxHighlightCode, setClipboardSyntaxHighlightCode } =
    useClipboardSyntaxHighlightSettingData()

  return (
    <SettingRow
      label="Syntax-highlight code snippets"
      description="When a clipboard item contains code, render it with syntax highlighting in the list and preview. Plain text and sensitive/redacted content are unaffected."
    >
      <Switch
        checked={clipboardSyntaxHighlightCode}
        onCheckedChange={setClipboardSyntaxHighlightCode}
      />
    </SettingRow>
  )
})
