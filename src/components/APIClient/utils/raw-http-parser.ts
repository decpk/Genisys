import type { ParsedRequest } from './curl-parser'
import type { HttpMethod } from '../APIClient.types'

export function parseRawHttp(input: string): ParsedRequest {
  const result: ParsedRequest = {
    name: 'Imported Request',
    method: 'GET',
    url: '',
    params: [],
    headers: [],
    bodyType: 'none',
    bodyContent: '',
    authType: 'none',
    authData: {},
  }

  const lines = input.split(/\r?\n/)
  let lineIdx = 0

  // Parse request line: METHOD /path HTTP/1.x  or  METHOD /path
  if (lines.length > 0) {
    const requestLine = lines[0].trim()
    const match = requestLine.match(/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(\S+)(?:\s+HTTP\/[\d.]+)?$/i)
    if (match) {
      result.method = match[1].toUpperCase() as HttpMethod
      result.url = match[2] // may be a path or full URL
      lineIdx = 1
    }
  }

  // Parse headers until blank line
  let host = ''
  while (lineIdx < lines.length) {
    const line = lines[lineIdx].trim()
    if (line === '') {
      lineIdx++
      break
    }
    const colonIdx = line.indexOf(':')
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim()
      const value = line.slice(colonIdx + 1).trim()
      if (key.toLowerCase() === 'host') {
        host = value
      } else {
        result.headers.push({
          id: crypto.randomUUID(),
          key,
          value,
          enabled: true,
        })
      }
    }
    lineIdx++
  }

  // Everything after blank line is the body
  const bodyLines = lines.slice(lineIdx)
  const body = bodyLines.join('\n').trim()
  if (body) {
    result.bodyContent = body
    result.bodyType = isJsonString(body) ? 'json' : 'raw'
    if (result.method === 'GET') result.method = 'POST'
  }

  // Build full URL from Host header + path if URL is relative
  if (result.url && !result.url.startsWith('http')) {
    const scheme = 'https'
    if (host) {
      result.url = `${scheme}://${host}${result.url.startsWith('/') ? '' : '/'}${result.url}`
    }
  }

  // Extract Authorization header → auth fields
  const authIdx = result.headers.findIndex((h) => h.key.toLowerCase() === 'authorization')
  if (authIdx !== -1) {
    const authHeader = result.headers[authIdx]
    if (authHeader.value.toLowerCase().startsWith('bearer ')) {
      result.authType = 'bearer'
      result.authData = { token: authHeader.value.slice(7) }
      result.headers.splice(authIdx, 1)
    } else if (authHeader.value.toLowerCase().startsWith('basic ')) {
      result.authType = 'basic'
      try {
        const decoded = atob(authHeader.value.slice(6))
        const [username, password] = decoded.split(':')
        result.authData = { username, password: password ?? '' }
      } catch {
        result.authData = { username: '', password: '' }
      }
      result.headers.splice(authIdx, 1)
    }
  }

  // Extract query params from URL
  if (result.url.includes('?')) {
    const [base, queryString] = result.url.split('?')
    result.url = base
    const searchParams = new URLSearchParams(queryString)
    searchParams.forEach((value, key) => {
      result.params.push({ id: crypto.randomUUID(), key, value, enabled: true })
    })
  }

  // Derive name from URL
  if (result.url) {
    try {
      const urlObj = new URL(result.url)
      const pathSegments = urlObj.pathname.split('/').filter(Boolean)
      result.name = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : urlObj.hostname
    } catch {
      result.name = 'Imported Request'
    }
  }

  return result
}

function isJsonString(str: string): boolean {
  const trimmed = str.trim()
  return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
}
