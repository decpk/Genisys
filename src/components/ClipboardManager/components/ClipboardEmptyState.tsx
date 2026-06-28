import { ClipboardPaste } from 'lucide-react'
import { MainEmptyState } from '@/components/ui/main-empty-state'

export function ClipboardEmptyState(): React.JSX.Element {
  return (
    <MainEmptyState
      icon={ClipboardPaste}
      title="No clipboard items yet"
      description="Copy text or images to see them appear here. Your clipboard history is stored locally and securely."
      hint="Items are automatically captured as you copy"
    />
  )
}
