import { useState, useEffect, useCallback, useMemo } from 'react'

import { useMockServerStore } from '@/store/mock-server-store'
import type { MockEndpoint } from '@/components/MockServer/MockServer.types'

type EditorTab = 'static' | 'ai' | 'variants' | 'headers'

interface HeaderPair {
  key: string
  value: string
}

function parseHeaders(raw: string): HeaderPair[] {
  try {
    const obj = JSON.parse(raw) as Record<string, string>
    return Object.entries(obj).map(([key, value]) => ({ key, value }))
  } catch {
    return [{ key: 'Content-Type', value: 'application/json' }]
  }
}

function serializeHeaders(pairs: HeaderPair[]): string {
  const obj: Record<string, string> = {}
  for (const pair of pairs) {
    if (pair.key.trim()) obj[pair.key.trim()] = pair.value
  }
  return JSON.stringify(obj)
}

export function useEndpointEditorData() {
  const selectedEndpointId = useMockServerStore((s) => s.activeEndpointTabId)
  const selectedServerId = useMockServerStore((s) => s.selectedServerId)
  const endpoints = useMockServerStore((s) => s.endpoints)
  const variants = useMockServerStore((s) => s.variants)
  const updateEndpoint = useMockServerStore((s) => s.updateEndpoint)
  const closeEndpointTab = useMockServerStore((s) => s.closeEndpointTab)

  const endpoint = useMemo((): MockEndpoint | null => {
    if (!selectedServerId || !selectedEndpointId) return null
    const list = endpoints[selectedServerId] ?? []
    return list.find((ep) => ep.id === selectedEndpointId) ?? null
  }, [selectedServerId, selectedEndpointId, endpoints])

  const variantsCount = useMemo(
    () => (endpoint ? (variants[endpoint.id]?.length ?? 0) : 0),
    [variants, endpoint]
  )

  const [method, setMethod] = useState('GET')
  const [path, setPath] = useState('/')
  const [statusCode, setStatusCode] = useState(200)
  const [responseBody, setResponseBody] = useState('{}')
  const [responseType, setResponseType] = useState<'static' | 'ai'>('static')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiSchema, setAiSchema] = useState('')
  const [aiCount, setAiCount] = useState(1)
  const [aiMode, setAiMode] = useState<MockEndpoint['ai_mode']>('live')
  const [aiCacheTtlMs, setAiCacheTtlMs] = useState(60000)
  const [aiPoolSize, setAiPoolSize] = useState(5)
  const [headers, setHeaders] = useState<HeaderPair[]>([
    { key: 'Content-Type', value: 'application/json' },
  ])
  const [description, setDescription] = useState('')
  const [delayMs, setDelayMs] = useState(0)
  const [activeTab, setActiveTab] = useState<EditorTab>('static')
  const [isDirty, setIsDirty] = useState(false)

  // Sync local form state when the selected endpoint ID changes (user switched endpoint).
  // We do NOT include the full `endpoint` object as a dep — that would reset the active
  // tab every time any field is saved back to the store (e.g. variant_mode update).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!endpoint) return
    setMethod(endpoint.method)
    setPath(endpoint.path)
    setStatusCode(endpoint.status_code)
    setResponseBody(endpoint.response_body)
    setResponseType(endpoint.response_type)
    setAiPrompt(endpoint.ai_prompt)
    setAiSchema(endpoint.ai_schema)
    setAiCount(endpoint.ai_count)
    setHeaders(parseHeaders(endpoint.response_headers))
    setDescription(endpoint.description)
    setDelayMs(endpoint.delay_ms)
    setIsDirty(false)

    const tab = endpoint.response_type === 'ai' ? 'ai' : 'static'
    setActiveTab(tab)
  }, [selectedEndpointId]) // intentionally keyed on ID only, not the full endpoint object

  const markDirty = useCallback(() => setIsDirty(true), [])

  const handleSave = useCallback(async () => {
    if (!endpoint) return
    const resolvedType = activeTab === 'ai' ? 'ai' : 'static'
    try {
      await updateEndpoint({
        ...endpoint,
        method,
        path,
        status_code: statusCode,
        response_body: responseBody,
        response_type: resolvedType,
        response_headers: serializeHeaders(headers),
        ai_prompt: aiPrompt,
        ai_schema: aiSchema,
        ai_count: aiCount,
        ai_mode: aiMode,
        ai_cache_ttl_ms: aiCacheTtlMs,
        ai_pool_size: aiPoolSize,
        description,
        delay_ms: delayMs,
      })
      setIsDirty(false)
    } catch {
      // Save failed — keep dirty state so user can retry
    }
  }, [
    endpoint, method, path, statusCode, responseBody, activeTab,
    headers, aiPrompt, aiSchema, aiCount, aiMode, aiCacheTtlMs, aiPoolSize,
    description, delayMs, updateEndpoint,
  ])

  const handleCancel = useCallback(() => {
    if (!endpoint) return
    setMethod(endpoint.method)
    setPath(endpoint.path)
    setStatusCode(endpoint.status_code)
    setResponseBody(endpoint.response_body)
    setResponseType(endpoint.response_type)
    setAiPrompt(endpoint.ai_prompt)
    setAiSchema(endpoint.ai_schema)
    setAiCount(endpoint.ai_count)
    setAiMode(endpoint.ai_mode ?? 'live')
    setAiCacheTtlMs(endpoint.ai_cache_ttl_ms ?? 60000)
    setAiPoolSize(endpoint.ai_pool_size ?? 5)
    setHeaders(parseHeaders(endpoint.response_headers))
    setDescription(endpoint.description)
    setDelayMs(endpoint.delay_ms)
    setIsDirty(false)
  }, [endpoint])

  const handleClose = useCallback(() => {
    if (selectedEndpointId) {
      closeEndpointTab(selectedEndpointId)
    }
  }, [selectedEndpointId, closeEndpointTab])

  const handlePathChange = useCallback(
    (value: string) => {
      const normalized = value.startsWith('/') ? value : '/' + value
      setPath(normalized)
      markDirty()
    },
    [markDirty]
  )

  const handleToggleActive = useCallback(async () => {
    if (!endpoint) return
    await updateEndpoint({ ...endpoint, is_active: !endpoint.is_active })
  }, [endpoint, updateEndpoint])

  return {
    endpoint,
    method,
    setMethod: (v: string) => { setMethod(v); markDirty() },
    path,
    handlePathChange,
    statusCode,
    setStatusCode: (v: number) => { setStatusCode(v); markDirty() },
    responseBody,
    setResponseBody: (v: string) => { setResponseBody(v); markDirty() },
    responseType,
    aiPrompt,
    setAiPrompt: (v: string) => { setAiPrompt(v); markDirty() },
    aiSchema,
    setAiSchema: (v: string) => { setAiSchema(v); markDirty() },
    aiMode,
    setAiMode: (v: MockEndpoint['ai_mode']) => { setAiMode(v); markDirty() },
    aiCacheTtlMs,
    setAiCacheTtlMs: (v: number) => { setAiCacheTtlMs(v); markDirty() },
    aiPoolSize,
    setAiPoolSize: (v: number) => { setAiPoolSize(v); markDirty() },
    headers,
    setHeaders: (v: HeaderPair[]) => { setHeaders(v); markDirty() },
    description,
    setDescription: (v: string) => { setDescription(v); markDirty() },
    delayMs,
    setDelayMs: (v: number) => { setDelayMs(v); markDirty() },
    handleToggleActive,
    activeTab,
    setActiveTab,
    variantsCount,
    isDirty,
    handleSave,
    handleCancel,
    handleClose,
  }
}
