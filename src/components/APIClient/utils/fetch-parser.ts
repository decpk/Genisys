import type { ParsedRequest } from './curl-parser'
import type { HttpMethod } from '../APIClient.types'

export function parseFetch(input: string): ParsedRequest {
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

  // Normalize line continuations and collapse whitespace
  const normalized = input.replace(/\\\n/g, ' ').replace(/\\\r\n/g, ' ').trim()

  // Extract URL: fetch("url" or fetch('url' or fetch(`url`
  const urlMatch = normalized.match(/fetch\s*\(\s*["'`]([^"'`]+)["'`]/)
  if (urlMatch) {
    result.url = urlMatch[1]
  }

  // Extract the options object (second argument) — find the content between the first , and the matching )
  const optionsStr = extractOptionsObject(normalized)

  if (optionsStr) {
    // Extract method
    const methodMatch = optionsStr.match(/method\s*:\s*["'`](\w+)["'`]/i)
    if (methodMatch) {
      result.method = methodMatch[1].toUpperCase() as HttpMethod
    }

    // Extract headers — supports object literal
    const headersMatch = optionsStr.match(/headers\s*:\s*(\{[^}]*\})/s)
    if (headersMatch) {
      parseJsObjectToHeaders(headersMatch[1], result)
    }

    // Also check for new Headers({...}) syntax
    const newHeadersMatch = optionsStr.match(/headers\s*:\s*new\s+Headers\s*\(\s*(\{[^}]*\})\s*\)/s)
    if (newHeadersMatch) {
      parseJsObjectToHeaders(newHeadersMatch[1], result)
    }

    // Extract body — handle JSON.stringify({...}) and plain strings
    const jsonStringifyMatch = optionsStr.match(/body\s*:\s*JSON\.stringify\s*\(([^)]+)\)/s)
    if (jsonStringifyMatch) {
      result.bodyContent = jsonStringifyMatch[1].trim()
      result.bodyType = 'json'
      if (result.method === 'GET') result.method = 'POST'
    } else {
      const bodyMatch = optionsStr.match(/body\s*:\s*["'`]([^"'`]*)["'`]/s)
      if (bodyMatch) {
        result.bodyContent = bodyMatch[1]
        result.bodyType = isJsonString(bodyMatch[1]) ? 'json' : 'raw'
        if (result.method === 'GET') result.method = 'POST'
      } else {
        // body: someVariable or body: `template` — try to capture what's there
        const bodyVarMatch = optionsStr.match(/body\s*:\s*([^,}\n]+)/s)
        if (bodyVarMatch) {
          const val = bodyVarMatch[1].trim()
          if (val && val !== 'undefined' && val !== 'null') {
            result.bodyContent = val
            result.bodyType = isJsonString(val) ? 'json' : 'raw'
            if (result.method === 'GET') result.method = 'POST'
          }
        }
      }
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

function extractOptionsObject(input: string): string | null {
  // Find the first comma after the URL string, then extract the object until the closing )
  const fetchIdx = input.indexOf('fetch')
  if (fetchIdx === -1) return null

  // Find the URL string end (first quote pair after fetch()
  const afterFetch = input.slice(fetchIdx)
  const urlQuoteMatch = afterFetch.match(/fetch\s*\(\s*["'`][^"'`]*["'`]\s*,/)
  if (!urlQuoteMatch) return null

  const optionsStart = fetchIdx + urlQuoteMatch.index! + urlQuoteMatch[0].length
  const rest = input.slice(optionsStart)

  // Find the matching brace
  let braceDepth = 0
  let start = -1
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '{') {
      if (start === -1) start = i
      braceDepth++
    } else if (rest[i] === '}') {
      braceDepth--
      if (braceDepth === 0 && start !== -1) {
        return rest.slice(start, i + 1)
      }
    }
  }
  return rest.slice(start === -1 ? 0 : start)
}

function parseJsObjectToHeaders(objStr: string, result: ParsedRequest): void {
  // Match "key": "value" or 'key': 'value' patterns
  const pairRegex = /["']([^"']+)["']\s*:\s*["'`]([^"'`]*)["'`]/g
  let match: RegExpExecArray | null
  while ((match = pairRegex.exec(objStr)) !== null) {
    result.headers.push({
      id: crypto.randomUUID(),
      key: match[1],
      value: match[2],
      enabled: true,
    })
  }
}

function isJsonString(str: string): boolean {
  const trimmed = str.trim()
  return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
}
