import type { ApiRequestItem, ApiResponse, KeyValuePair, ApiEnvironmentVariable } from '../APIClient.types'

function interpolateVariables(text: string, variables: ApiEnvironmentVariable[]): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const v = variables.find((vr) => vr.key === key && vr.enabled)
    if (v) return v.value
    return match
  })
}

export async function executeRequest(
  request: ApiRequestItem,
  options?: { environmentId?: string | null; variables?: ApiEnvironmentVariable[]; baseUrl?: string; sendId?: string }
): Promise<ApiResponse> {
  const vars = options?.variables ?? []

  // Interpolate URL with environment variables
  let rawUrl = request.url
  if (vars.length > 0) {
    rawUrl = interpolateVariables(rawUrl, vars)
  }
  // Prepend base URL if the URL is relative
  if (options?.baseUrl && rawUrl && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    const base = interpolateVariables(options.baseUrl, vars)
    rawUrl = `${base.replace(/\/$/, '')}/${rawUrl.replace(/^\//, '')}`
  }

  // Build URL with query params
  let fullUrl = rawUrl
  const enabledParams = request.params.filter((p) => p.enabled && p.key)
  if (enabledParams.length > 0) {
    const searchParams = new URLSearchParams()
    enabledParams.forEach((p) => {
      const val = vars.length > 0 ? interpolateVariables(p.value, vars) : p.value
      searchParams.append(p.key, val)
    })
    const separator = fullUrl.includes('?') ? '&' : '?'
    fullUrl = `${fullUrl}${separator}${searchParams.toString()}`
  }

  // Build headers (with variable interpolation)
  const headersObj: Record<string, string> = {}
  const enabledHeaders = request.headers.filter((h) => h.enabled && h.key)
  enabledHeaders.forEach((h) => {
    headersObj[h.key] = vars.length > 0 ? interpolateVariables(h.value, vars) : h.value
  })

  // Add auth headers
  applyAuth(headersObj, request, vars)

  // Build body (with variable interpolation)
  let body: string | undefined
  if (request.method !== 'GET' && request.method !== 'HEAD' && request.bodyType !== 'none') {
    body = vars.length > 0 ? interpolateVariables(request.bodyContent, vars) : request.bodyContent
    if (request.bodyType === 'json' && body) {
      try { body = JSON.stringify(JSON.parse(body)) } catch { /* send as-is */ }
    }
  }

  try {
    // Use Tauri backend to make the HTTP request (avoids CORS)
    const response = await window.api.apiSendRequest({
      method: request.method,
      url: fullUrl,
      headers: headersObj,
      body,
      requestId: request.id,
      requestName: request.name,
      environmentId: options?.environmentId ?? undefined,
      sendId: options?.sendId,
    })

    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      body: response.body,
      time: response.time,
      size: response.size,
      executionId: response.executionId,
    }
  } catch (error) {
    return {
      status: 0,
      statusText: error instanceof Error ? error.message : String(error),
      headers: {},
      body: error instanceof Error ? error.message : String(error),
      time: 0,
      size: 0,
    }
  }
}

function applyAuth(headers: Record<string, string>, request: ApiRequestItem, vars: ApiEnvironmentVariable[]): void {
  const interp = (s: string | undefined) => {
    if (!s) return s
    return vars.length > 0 ? interpolateVariables(s, vars) : s
  }

  if (request.authType === 'bearer' && request.authData.token) {
    headers['Authorization'] = `Bearer ${interp(request.authData.token)}`
  } else if (request.authType === 'basic' && request.authData.username) {
    const encoded = btoa(`${interp(request.authData.username)}:${interp(request.authData.password) ?? ''}`)
    headers['Authorization'] = `Basic ${encoded}`
  } else if (request.authType === 'api-key' && request.authData.key && request.authData.value) {
    if (request.authData.addTo === 'query') return // handled by caller
    headers[request.authData.key] = interp(request.authData.value) ?? ''
  }
}

export function buildUrlWithApiKeyAuth(
  url: string,
  params: KeyValuePair[],
  request: ApiRequestItem
): string {
  let fullUrl = url
  const enabledParams = params.filter((p) => p.enabled && p.key)
  const allParams = [...enabledParams]

  if (request.authType === 'api-key' && request.authData.addTo === 'query' && request.authData.key) {
    allParams.push({ id: '', key: request.authData.key, value: request.authData.value ?? '', enabled: true })
  }

  if (allParams.length > 0) {
    const searchParams = new URLSearchParams()
    allParams.forEach((p) => searchParams.append(p.key, p.value))
    const separator = fullUrl.includes('?') ? '&' : '?'
    fullUrl = `${fullUrl}${separator}${searchParams.toString()}`
  }

  return fullUrl
}
