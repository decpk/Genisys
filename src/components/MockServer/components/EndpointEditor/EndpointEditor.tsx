import { useEffect } from 'react'
import { Save, ChevronDown, GitBranch } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dropdown } from '@/components/ui/dropdown'
import type { DropdownItem } from '@/components/ui/dropdown'
import { useEndpointEditorData } from './useEndpointEditorData'
import { StaticResponseTab } from './StaticResponseTab'
import { AIResponseTab } from './AIResponseTab'
import { HeadersEditor } from './HeadersEditor'
import { VariantsTab } from './components/VariantsTab'

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']
const STATUS_PRESETS = [200, 201, 204, 400, 401, 403, 404, 500]

function getStatusDotColor(code: number): string {
  if (code >= 200 && code < 300) return 'bg-emerald-500'
  if (code >= 300 && code < 400) return 'bg-blue-500'
  if (code >= 400 && code < 500) return 'bg-amber-500'
  if (code >= 500) return 'bg-red-500'
  return 'bg-gray-400'
}

function getStatusPillColor(code: number): string {
  if (code >= 200 && code < 300) return 'bg-emerald-500/10 text-emerald-500'
  if (code >= 300 && code < 400) return 'bg-blue-500/10 text-blue-500'
  if (code >= 400 && code < 500) return 'bg-amber-500/10 text-amber-500'
  if (code >= 500) return 'bg-red-500/10 text-red-500'
  return ''
}

const METHOD_DOT_COLORS: Record<string, string> = {
  GET: 'bg-emerald-500',
  POST: 'bg-blue-500',
  PUT: 'bg-amber-500',
  PATCH: 'bg-yellow-500',
  DELETE: 'bg-red-500',
  OPTIONS: 'bg-purple-500',
  HEAD: 'bg-gray-400',
}

const METHOD_PILL_COLORS: Record<string, string> = {
  GET: 'bg-emerald-500/15 text-emerald-500',
  POST: 'bg-blue-500/15 text-blue-500',
  PUT: 'bg-amber-500/15 text-amber-500',
  PATCH: 'bg-yellow-500/15 text-yellow-500',
  DELETE: 'bg-red-500/15 text-red-500',
  OPTIONS: 'bg-purple-500/15 text-purple-500',
  HEAD: 'bg-gray-500/15 text-gray-400',
}

type EditorTab = 'static' | 'ai' | 'variants' | 'headers'

const TAB_ITEMS: { id: EditorTab; label: string }[] = [
  { id: 'static', label: 'Static Response' },
  { id: 'ai', label: '✨ AI Generated' },
  { id: 'variants', label: 'Variants' },
  { id: 'headers', label: 'Headers' },
]

export function EndpointEditor() {
  const {
    endpoint,
    method,
    setMethod,
    path,
    handlePathChange,
    statusCode,
    setStatusCode,
    responseBody,
    setResponseBody,
    aiPrompt,
    setAiPrompt,
    aiSchema,
    setAiSchema,
    aiMode,
    setAiMode,
    aiCacheTtlMs,
    setAiCacheTtlMs,
    aiPoolSize,
    setAiPoolSize,
    headers,
    setHeaders,
    description,
    setDescription,
    delayMs,
    setDelayMs,
    handleToggleActive,
    activeTab,
    setActiveTab,
    variantsCount,
    isDirty,
    handleSave,
    handleCancel,
  } = useEndpointEditorData()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (isDirty) handleSave()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isDirty, handleSave])

  if (!endpoint) return null

  const methodItems: DropdownItem[] = METHODS.map((m) => ({
    key: m,
    label: m,
    active: m === method,
    prefix: <span className={`inline-block size-2 rounded-full ${METHOD_DOT_COLORS[m] ?? 'bg-gray-400'}`} />,
    onSelect: () => setMethod(m),
  }))

  const handleAcceptAiResponse = (generatedBody: string) => {
    setResponseBody(generatedBody)
    setActiveTab('static')
  }

  const tabContent =
    activeTab === 'static' ? (
      <StaticResponseTab value={responseBody} onChange={setResponseBody} />
    ) : activeTab === 'ai' ? (
      <AIResponseTab
        schema={aiSchema}
        onSchemaChange={setAiSchema}
        prompt={aiPrompt}
        onPromptChange={setAiPrompt}
        onAccept={handleAcceptAiResponse}
        mode={aiMode}
        onModeChange={setAiMode}
        cacheTtlMs={aiCacheTtlMs}
        onCacheTtlChange={setAiCacheTtlMs}
        poolSize={aiPoolSize}
        onPoolSizeChange={setAiPoolSize}
      />
    ) : activeTab === 'variants' ? (
      <VariantsTab />
    ) : (
      <HeadersEditor headers={headers} onChange={setHeaders} />
    )

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Fixed top: config card + tab switcher */}
      <div className="shrink-0 px-4 pt-4 pb-0">
        <div className="flex flex-col gap-4">
          {/* Method + Path + Status — card wrapper */}
          <div className="rounded-lg border border-border/30 bg-muted/10 p-3">
            <div className="flex items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Method
                </label>
                <Dropdown
                  items={methodItems}
                  openOn="click"
                  align="left"
                  showCheck
                  menuWidth="140px"
                  trigger={
                    <button
                      className={cn(
                        "flex items-center gap-1.5 h-9 px-2.5 text-sm font-medium rounded-lg border border-border/30 bg-background cursor-pointer transition-all",
                        METHOD_PILL_COLORS[method] ?? "",
                      )}
                    >
                      {method}
                      <ChevronDown size={11} className="opacity-50" />
                    </button>
                  }
                />
              </div>

              <div className="flex flex-1 flex-col gap-1.5">
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Path
                </label>
                <input
                  type="text"
                  value={path}
                  onChange={(e) => handlePathChange(e.target.value)}
                  placeholder="/api/users"
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/30 transition-shadow"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </label>
                <Dropdown
                  items={STATUS_PRESETS.map(
                    (code): DropdownItem => ({
                      key: String(code),
                      label: String(code),
                      active: code === statusCode,
                      prefix: (
                        <span
                          className={cn(
                            "inline-block size-2 rounded-full",
                            getStatusDotColor(code),
                          )}
                        />
                      ),
                      onSelect: () => setStatusCode(code),
                    }),
                  )}
                  openOn="click"
                  align="left"
                  showCheck
                  menuWidth="140px"
                  trigger={
                    <button
                      className={cn(
                        "flex items-center gap-1.5 h-9 px-2.5 text-sm font-medium rounded-lg border border-border/30 bg-background cursor-pointer transition-all",
                        getStatusPillColor(statusCode),
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block size-2 rounded-full",
                          getStatusDotColor(statusCode),
                        )}
                      />
                      {statusCode}
                      <ChevronDown size={11} className="opacity-50" />
                    </button>
                  }
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Delay
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={delayMs}
                    onChange={(e) =>
                      setDelayMs(Math.max(0, Number(e.target.value) || 0))
                    }
                    placeholder="0"
                    className="h-9 w-24 rounded-lg border border-input bg-background px-3 pr-8 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/30 transition-shadow [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground font-medium pointer-events-none">
                    ms
                  </span>
                </div>
              </div>
            </div>

            {/* Description + Active toggle */}
            <div className="mt-3 flex items-center gap-3">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                className="h-8 flex-1 rounded-lg border-0 bg-transparent px-0 text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
              />
              <label className="flex shrink-0 items-center gap-2 cursor-pointer">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Active
                </span>
                <Switch
                  checked={endpoint.is_active}
                  onCheckedChange={handleToggleActive}
                />
              </label>
            </div>
          </div>

          {/* Tab Switcher */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as EditorTab)}
          >
            <TabsList>
              {TAB_ITEMS.map((tab) => {
                const prefix =
                  tab.id === 'variants' ? <GitBranch className="h-3 w-3" /> : null
                const badge =
                  tab.id === 'variants' && variantsCount > 0 ? (
                    <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/15 px-1 text-[10px] font-medium text-primary tabular-nums">
                      {variantsCount}
                    </span>
                  ) : null
                return (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    <span className="inline-flex items-center gap-1.5">
                      {prefix}
                      {tab.label}
                      {badge}
                    </span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Tab Content — fills remaining height */}
      <div className="flex flex-1 flex-col overflow-hidden px-4 py-4">
        {tabContent}
      </div>

      {/* Footer — shown only when there are unsaved changes */}
      {isDirty && (
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border/30 px-4 py-2.5">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
        </div>
      )}
    </div>
  );
}
