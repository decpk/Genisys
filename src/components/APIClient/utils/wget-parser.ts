import type { ParsedRequest } from './curl-parser'
import type { HttpMethod } from '../APIClient.types'

export function parseWget(input: string): ParsedRequest {
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

  // Normalize line continuations
  const normalized = input.replace(/\\\n/g, ' ').replace(/\\\r\n/g, ' ').trim()
  const tokens = tokenize(normalized)
  let i = 0

  // Skip "wget" prefix
  if (tokens[0]?.toLowerCase() === 'wget') i++

  while (i < tokens.length) {
    const token = tokens[i]

    if (token === '--method' || token === '--method=') {
      // --method=POST or --method POST
      if (token.includes('=')) {
        const val = token.split('=')[1]
        if (val) result.method = val.toUpperCase() as HttpMethod
      } else {
        i++
        if (i < tokens.length) result.method = tokens[i].toUpperCase() as HttpMethod
      }
    } else if (token.startsWith('--method=')) {
      result.method = token.slice('--method='.length).toUpperCase() as HttpMethod
    } else if (token === '--header' || token === '-H') {
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
    } else if (token.startsWith('--header=')) {
      const val = token.slice('--header='.length)
      const header = parseHeaderValue(val)
      if (header) {
        result.headers.push({
          id: crypto.randomUUID(),
          key: header.key,
          value: header.value,
          enabled: true,
        })
      }
    } else if (token === '--body-data' || token === '--post-data') {
      i++
      if (i < tokens.length) {
        result.bodyContent = tokens[i]
        result.bodyType = isJsonString(tokens[i]) ? 'json' : 'raw'
        if (result.method === 'GET') result.method = 'POST'
      }
    } else if (token.startsWith('--body-data=') || token.startsWith('--post-data=')) {
      const eqIdx = token.indexOf('=')
      const val = token.slice(eqIdx + 1)
      result.bodyContent = val
      result.bodyType = isJsonString(val) ? 'json' : 'raw'
      if (result.method === 'GET') result.method = 'POST'
    } else if (token === '--post-file' || token === '--body-file') {
      i++ // skip the filename — can't read file contents
    } else if (token === '--http-user') {
      i++
      if (i < tokens.length) {
        result.authType = 'basic'
        result.authData = { ...result.authData, username: tokens[i] }
      }
    } else if (token.startsWith('--http-user=')) {
      result.authType = 'basic'
      result.authData = { ...result.authData, username: token.slice('--http-user='.length) }
    } else if (token === '--http-password') {
      i++
      if (i < tokens.length) {
        result.authType = 'basic'
        result.authData = { ...result.authData, password: tokens[i] }
      }
    } else if (token.startsWith('--http-password=')) {
      result.authType = 'basic'
      result.authData = { ...result.authData, password: token.slice('--http-password='.length) }
    } else if (token === '-O' || token === '--output-document' || token === '-q' || token === '--quiet') {
      // Skip output/quiet flags
      if (token === '-O' || token === '--output-document') {
        i++ // skip the filename argument
      }
    } else if (!token.startsWith('-') && !result.url) {
      result.url = token
    }

    i++
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

function tokenize(input: string): string[] {
  const tokens: string[] = []
  let i = 0
  while (i < input.length) {
    while (i < input.length && /\s/.test(input[i])) i++
    if (i >= input.length) break

    const char = input[i]
    if (char === "'" || char === '"') {
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
      i++
      tokens.push(value)
    } else {
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
