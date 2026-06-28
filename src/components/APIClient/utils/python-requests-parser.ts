import type { ParsedRequest } from './curl-parser'
import type { HttpMethod } from '../APIClient.types'

export function parsePythonRequests(input: string): ParsedRequest {
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

  // Normalize line continuations (Python uses \ at end of line)
  const normalized = input.replace(/\\\n/g, ' ').replace(/\\\r\n/g, ' ').trim()

  // Pattern: requests.method("url", ...) or requests.method('url', ...)
  const methodCallMatch = normalized.match(
    /requests\s*\.\s*(get|post|put|patch|delete|head|options|request)\s*\(\s*["']([^"']+)["']/i
  )

  if (methodCallMatch) {
    const methodName = methodCallMatch[1].toLowerCase()
    result.method = (methodName === 'request' ? 'GET' : methodName.toUpperCase()) as HttpMethod
    result.url = methodCallMatch[2]

    // For requests.request(), there may be a method= kwarg
    if (methodName === 'request') {
      const reqMethodMatch = normalized.match(/method\s*=\s*["'](\w+)["']/i)
      if (reqMethodMatch) {
        result.method = reqMethodMatch[1].toUpperCase() as HttpMethod
      }
    }
  }

  // Extract headers={...} — Python dict syntax
  const headersMatch = normalized.match(/headers\s*=\s*(\{[^}]*\})/s)
  if (headersMatch) {
    parsePythonDict(headersMatch[1], (key, value) => {
      result.headers.push({ id: crypto.randomUUID(), key, value, enabled: true })
    })
  }

  // Extract json={...} — takes priority as JSON body
  const jsonMatch = normalized.match(/json\s*=\s*(\{[^}]*\})/s)
  if (jsonMatch) {
    result.bodyContent = pythonDictToJson(jsonMatch[1])
    result.bodyType = 'json'
  }

  // Extract data={...} or data="..." — raw body (only if no json= was found)
  if (!jsonMatch) {
    const dataObjMatch = normalized.match(/data\s*=\s*(\{[^}]*\})/s)
    if (dataObjMatch) {
      result.bodyContent = pythonDictToJson(dataObjMatch[1])
      result.bodyType = 'json'
    } else {
      const dataStrMatch = normalized.match(/data\s*=\s*["']([^"']*)["']/s)
      if (dataStrMatch) {
        result.bodyContent = dataStrMatch[1]
        result.bodyType = isJsonString(dataStrMatch[1]) ? 'json' : 'raw'
      }
    }
  }

  // Extract params={...} — query parameters
  const paramsMatch = normalized.match(/params\s*=\s*(\{[^}]*\})/s)
  if (paramsMatch) {
    parsePythonDict(paramsMatch[1], (key, value) => {
      result.params.push({ id: crypto.randomUUID(), key, value, enabled: true })
    })
  }

  // Extract auth=("user", "pass") — basic auth tuple
  const authMatch = normalized.match(/auth\s*=\s*\(\s*["']([^"']*)["']\s*,\s*["']([^"']*)["']\s*\)/)
  if (authMatch) {
    result.authType = 'basic'
    result.authData = { username: authMatch[1], password: authMatch[2] }
  }

  // Extract auth=HTTPBasicAuth("user", "pass")
  const basicAuthMatch = normalized.match(/auth\s*=\s*HTTPBasicAuth\s*\(\s*["']([^"']*)["']\s*,\s*["']([^"']*)["']\s*\)/)
  if (basicAuthMatch) {
    result.authType = 'basic'
    result.authData = { username: basicAuthMatch[1], password: basicAuthMatch[2] }
  }

  // Extract timeout, verify, etc. — ignored (not relevant for request building)

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

  // Derive name
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

function parsePythonDict(dictStr: string, callback: (key: string, value: string) => void): void {
  // Match 'key': 'value' or "key": "value" patterns in Python dict
  const pairRegex = /["']([^"']+)["']\s*:\s*["']([^"']*)["']/g
  let match: RegExpExecArray | null
  while ((match = pairRegex.exec(dictStr)) !== null) {
    callback(match[1], match[2])
  }
}

function pythonDictToJson(dictStr: string): string {
  // Convert Python dict syntax to JSON
  // Replace single quotes with double quotes, handle True/False/None
  let json = dictStr
    .replace(/'/g, '"')
    .replace(/\bTrue\b/g, 'true')
    .replace(/\bFalse\b/g, 'false')
    .replace(/\bNone\b/g, 'null')

  // Try to parse and re-format
  try {
    const parsed = JSON.parse(json)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return json
  }
}

function isJsonString(str: string): boolean {
  const trimmed = str.trim()
  return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
}
