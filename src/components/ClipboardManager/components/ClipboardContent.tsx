import { ClipboardToolbar } from './ClipboardToolbar'
import { ClipboardVirtualList } from './ClipboardVirtualList'
import { ClipboardEmptyState } from './ClipboardEmptyState'
import { ClipboardPreviewModal } from './ClipboardPreviewModal'
import { useClipboardContentData } from './useClipboardContentData'

export function ClipboardContent(): React.JSX.Element {
  const { showEmptyState } = useClipboardContentData()

  const content = showEmptyState ? <ClipboardEmptyState /> : <ClipboardVirtualList />

  return (
    <div className="flex flex-col h-full">
      <ClipboardToolbar />
      {content}
      <ClipboardPreviewModal />
    </div>
  )
}
