import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { KeyValueEditor } from './KeyValueEditor'
import { BodyEditor } from './BodyEditor'
import { AuthEditor } from './AuthEditor'
import { CodeGenerator } from '../CodeGenerator/CodeGenerator'
import type { ApiRequestItem, KeyValuePair, BodyType, AuthType, AuthData } from '../../APIClient.types'

interface RequestTabsProps {
  request: ApiRequestItem
  onUpdate: (updates: Partial<ApiRequestItem>) => void
}

export function RequestTabs(props: RequestTabsProps): React.JSX.Element {
  const { request, onUpdate } = props
  const [activeTab, setActiveTab] = useState('params')

  const paramsCount = request.params.filter((p) => p.enabled && p.key).length
  const headersCount = request.headers.filter((h) => h.enabled && h.key).length
  const hasBody = request.bodyType !== 'none' && request.bodyContent.trim().length > 0
  const authLabels: Record<AuthType, string> = {
    none: '',
    bearer: 'Bearer',
    basic: 'Basic',
    'api-key': 'API Key',
  }
  const authLabel = request.authType !== 'none' ? authLabels[request.authType] : ''

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="border-b border-border/40">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mx-2">
            <TabsTrigger value="params">
              <span className="flex items-center gap-1.5">
                Params
                {paramsCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-muted text-2xs font-medium text-muted-foreground">
                    {paramsCount}
                  </span>
                )}
              </span>
            </TabsTrigger>
            <TabsTrigger value="headers">
              <span className="flex items-center gap-1.5">
                Headers
                {headersCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-muted text-2xs font-medium text-muted-foreground">
                    {headersCount}
                  </span>
                )}
              </span>
            </TabsTrigger>
            <TabsTrigger value="body">
              <span className="flex items-center gap-1.5">
                Body
                {hasBody && (
                  <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-muted text-2xs font-medium text-muted-foreground">
                    {request.bodyType}
                  </span>
                )}
              </span>
            </TabsTrigger>
            <TabsTrigger value="auth">
              <span className="flex items-center gap-1.5">
                Auth
                {authLabel && (
                  <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-muted text-2xs font-medium text-muted-foreground">
                    {authLabel}
                  </span>
                )}
              </span>
            </TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === "params" && (
          <KeyValueEditor
            pairs={request.params}
            onChange={(params: KeyValuePair[]) => onUpdate({ params })}
            keyPlaceholder="Parameter"
            valuePlaceholder="Value"
          />
        )}
        {activeTab === "headers" && (
          <KeyValueEditor
            pairs={request.headers}
            onChange={(headers: KeyValuePair[]) => onUpdate({ headers })}
            keyPlaceholder="Header"
            valuePlaceholder="Value"
          />
        )}
        {activeTab === "body" && (
          <BodyEditor
            bodyType={request.bodyType}
            bodyContent={request.bodyContent}
            onTypeChange={(bodyType: BodyType) => onUpdate({ bodyType })}
            onContentChange={(bodyContent: string) => onUpdate({ bodyContent })}
          />
        )}
        {activeTab === "auth" && (
          <AuthEditor
            authType={request.authType}
            authData={request.authData}
            onTypeChange={(authType: AuthType) => onUpdate({ authType })}
            onDataChange={(authData: AuthData) => onUpdate({ authData })}
          />
        )}
        {activeTab === "code" && <CodeGenerator request={request} />}
      </div>
    </div>
  );
}
