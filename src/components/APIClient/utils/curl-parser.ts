import type { HttpMethod, BodyType, AuthType, AuthData, KeyValuePair } from '../APIClient.types'

export interface ParsedRequest {
  name: string
  method: HttpMethod
  url: string
  params: KeyValuePair[]
  headers: KeyValuePair[]
  bodyType: BodyType
  bodyContent: string
  authType: AuthType
  authData: AuthData
}

export function parseCurl(input: string): ParsedRequest {
  const trimmed = input.trim().replace(/\\\n/g, ' ').replace(/\\\r\n/g, ' ')
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

  const tokens = tokenize(trimmed)
  let i = 0

  // Skip "curl" prefix
  if (tokens[0]?.toLowerCase() === 'curl') i++

  while (i < tokens.length) {
    const token = tokens[i]

    if (token === '-X' || token === '--request') {
      i++
      if (i < tokens.length) result.method = tokens[i].toUpperCase() as HttpMethod
    } else if (token === '-H' || token === '--header') {
      i++
      if (i < tokens.length) {
        const header = parseHeaderValue(tokens[i])
        if (header) {
          result.headers.push({
            id: crypto.randomUUID(),
            key: header.key,
            value: header.value,
            enabled: true,
          })
        }
      }
    } else if (token === '-d' || token === '--data' || token === '--data-raw' || token === '--data-binary') {
      i++
      if (i < tokens.length) {
        result.bodyContent = tokens[i]
        result.bodyType = isJsonString(tokens[i]) ? 'json' : 'raw'
        if (result.method === 'GET') result.method = 'POST'
      }
    } else if (token === '-u' || token === '--user') {
      i++
      if (i < tokens.length) {
        const [username, password] = tokens[i].split(':')
        result.authType = 'basic'
        result.authData = { username, password: password ?? '' }
      }
    } else if (token === '-b' || token === '--cookie') {
      i++
      if (i < tokens.length) {
        const cookieValue = tokens[i]
        // `-b` may be a cookie string ("a=1; b=2") or a filename. We only
        // support inline cookie strings (must contain "="); ignore file refs.
        if (cookieValue.includes('=')) {
          const existing = result.headers.find((h) => h.key.toLowerCase() === 'cookie')
          if (existing) {
            existing.value = existing.value ? `${existing.value}; ${cookieValue}` : cookieValue
          } else {
            result.headers.push({
              id: crypto.randomUUID(),
              key: 'Cookie',
              value: cookieValue,
              enabled: true,
            })
          }
        }
      }
    } else if (!token.startsWith('-') && !result.url) {
      result.url = token
    }

    i++
  }

  // Check for Authorization header → extract auth
  const authHeaderIdx = result.headers.findIndex(
    (h) => h.key.toLowerCase() === 'authorization'
  )
  if (authHeaderIdx !== -1) {
    const authHeader = result.headers[authHeaderIdx]
    if (authHeader.value.toLowerCase().startsWith('bearer ')) {
      result.authType = 'bearer'
      result.authData = { token: authHeader.value.slice(7) }
      result.headers.splice(authHeaderIdx, 1)
    } else if (authHeader.value.toLowerCase().startsWith('basic ')) {
      result.authType = 'basic'
      try {
        const decoded = atob(authHeader.value.slice(6))
        const [username, password] = decoded.split(':')
        result.authData = { username, password: password ?? '' }
      } catch {
        result.authData = { username: '', password: '' }
      }
      result.headers.splice(authHeaderIdx, 1)
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

  // Derive name from URL path
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

function tokenize(input: string): string[] {
  const tokens: string[] = []
  let i = 0

  while (i < input.length) {
    // Skip whitespace
    while (i < input.length && /\s/.test(input[i])) i++
    if (i >= input.length) break

    const char = input[i]

    if (char === "'" || char === '"') {
      // Quoted string
      const quote = char
      i++
      let value = ''
      while (i < input.length && input[i] !== quote) {
        if (input[i] === '\\' && i + 1 < input.length) {
          i++
          value += input[i]
        } else {
          value += input[i]
        }
        i++
      }
      i++ // skip closing quote
      tokens.push(value)
    } else {
      // Unquoted token
      let value = ''
      while (i < input.length && !/\s/.test(input[i])) {
        value += input[i]
        i++
      }
      tokens.push(value)
    }
  }

  return tokens
}

function parseHeaderValue(raw: string): { key: string; value: string } | null {
  const colonIdx = raw.indexOf(':')
  if (colonIdx === -1) return null
  return {
    key: raw.slice(0, colonIdx).trim(),
    value: raw.slice(colonIdx + 1).trim(),
  }
}

function isJsonString(str: string): boolean {
  const trimmed = str.trim()
  return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
         (trimmed.startsWith('[') && trimmed.endsWith(']'))
}
