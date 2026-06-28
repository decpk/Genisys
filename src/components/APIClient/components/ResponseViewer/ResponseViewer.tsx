import { useState, useMemo, useCallback } from 'react'
import { Copy, Check, Code, TreePine, ArrowUp, Square, Ban } from 'lucide-react'
import { AppLoader } from '@/components/AppLoader/AppLoader'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResponseMeta } from './ResponseMeta'
import { ResponseBody } from './ResponseBody'
import { ResponseHeaders } from './ResponseHeaders'
import { useResponseViewerData } from './useResponseViewerData'
import { formatResponseBody } from '../../utils/format-response'

type ViewMode = 'parsed' | 'raw'
const LARGE_THRESHOLD = 100_000

function isJsonContent(body: string, contentType?: string): boolean {
  if (contentType?.includes('json')) return true
  const trimmed = body.trim()
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      JSON.parse(body)
      return true
    } catch {
      return false
    }
  }
  return false
}

export function ResponseViewer(): React.JSX.Element {
  const { response, isSending, contentType, handleCancel } = useResponseViewerData()
  const [activeTab, setActiveTab] = useState('body')

  const body = response?.body ?? ''
  const isJson = useMemo(() => (body ? isJsonContent(body, contentType) : false), [body, contentType])
  const isLarge = body.length > LARGE_THRESHOLD

  const [viewMode, setViewMode] = useState<ViewMode>(isLarge ? 'raw' : 'parsed')

  const canParse = useMemo(() => {
    if (!isJson || isLarge) return false
    try {
      JSON.parse(body)
      return true
    } catch {
      return false
    }
  }, [body, isJson, isLarge])

  const formatted = useMemo(() => formatResponseBody(body, contentType), [body, contentType])

  const [copied, setCopied] = useState(false)
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(formatted)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [formatted])

  if (isSending) {
    return (
      <div className="flex flex-col h-full">
        <div className="h-[1px] w-full overflow-hidden bg-muted/30">
          <div className="h-full w-1/3 bg-primary/60 rounded-full animate-[indeterminate_1.2s_ease-in-out_infinite]" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <AppLoader size={20} text="Sending request..." fullScreen={false} />
          <Button onClick={handleCancel} variant="outline" size="sm" className="gap-1.5">
            <Square size={11} className="fill-current" />
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  if (response?.cancelled) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <Ban size={16} className="text-muted-foreground/30" />
        <span className="text-xs text-muted-foreground/50">Request cancelled</span>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <ArrowUp size={16} className="text-muted-foreground/25" />
        <span className="text-xs text-muted-foreground/40">
          Hit <kbd className="px-1.5 py-0.5 rounded bg-muted/50 text-2xs font-sans border border-border/30">⌘ Enter</kbd> to send
        </span>
      </div>
    )
  }

  const headersCount = Object.keys(response.headers).length
  const showBodyControls = activeTab === 'body' && !!body

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-200">
      <ResponseMeta response={response} />
      <div className="flex items-center border-b border-border/30 px-2">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="body">Body</TabsTrigger>
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
          </TabsList>
        </Tabs>
        {showBodyControls && (
          <div className="flex items-center gap-1 ml-auto">
            <IconButton
              size="xs"
              variant="ghost"
              onClick={handleCopy}
              tooltip="Copy response"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </IconButton>
            {isJson && (
              <div className="flex items-center rounded-lg bg-foreground/[0.07] border border-border/50 p-0.5 gap-0.5 shadow-sm">
                <button
                  onClick={() => setViewMode("raw")}
                  className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-md transition-all cursor-pointer ${
                    viewMode === "raw"
                      ? "bg-background text-foreground shadow-sm border border-border/30"
                      : "text-muted-foreground hover:text-foreground border border-transparent"
                  }`}
                >
                  <Code size={11} />
                  Raw
                </button>
                <button
                  onClick={() => setViewMode("parsed")}
                  disabled={!canParse}
                  className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    viewMode === "parsed"
                      ? "bg-background text-foreground shadow-sm border border-border/30"
                      : "text-muted-foreground hover:text-foreground border border-transparent"
                  }`}
                >
                  <TreePine size={11} />
                  Parsed
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex-1 min-h-0">
        {activeTab === "body" && (
          <ResponseBody
            body={body}
            contentType={contentType}
            viewMode={viewMode}
          />
        )}
        {activeTab === "headers" && (
          <div className="h-full overflow-auto">
            <ResponseHeaders headers={response.headers} />
          </div>
        )}
      </div>
    </div>
  );
}
