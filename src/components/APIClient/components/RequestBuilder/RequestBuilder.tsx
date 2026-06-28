import { RequestURLBar } from './RequestURLBar'
import { RequestTabs } from './RequestTabs'
import { RequestBuilderEmptyState } from './RequestBuilderEmptyState'
import { useRequestBuilderData } from './hooks/useRequestBuilderData'

export function RequestBuilder(): React.JSX.Element {
  const {
    activeRequest,
    isSending,
    handleUpdate,
    handleMethodChange,
    handleUrlChange,
    handleSend,
    handleCancel,
    handleImportText,
  } = useRequestBuilderData()

  if (!activeRequest) {
    return <RequestBuilderEmptyState />
  }

  return (
    <div className="flex flex-col h-full">
      <RequestURLBar
        method={activeRequest.method}
        url={activeRequest.url}
        isSending={isSending}
        onMethodChange={handleMethodChange}
        onUrlChange={handleUrlChange}
        onSend={handleSend}
        onCancel={handleCancel}
        onImportText={handleImportText}
      />
      <RequestTabs request={activeRequest} onUpdate={handleUpdate} />
    </div>
  )
}
