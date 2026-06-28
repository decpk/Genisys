import type { ParsedRequest } from './curl-parser'
import type { HttpMethod } from '../APIClient.types'

export function parseHttpie(input: string): ParsedRequest {
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

  // Skip "http" or "https" prefix command
  if (tokens[0]?.toLowerCase() === 'http' || tokens[0]?.toLowerCase() === 'https') {
    i++
  }

  // Check if next token is a known HTTP method
  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
  if (i < tokens.length && methods.includes(tokens[i].toUpperCase())) {
    result.method = tokens[i].toUpperCase() as HttpMethod
    i++
  }

  // Collect JSON body fields to build body later
  const jsonBodyFields: Record<string, string> = {}
  let hasJsonFields = false
  let hasRawBody = false

  while (i < tokens.length) {
    const token = tokens[i]

    if (token === '--auth' || token === '-a') {
      i++
      if (i < tokens.length) {
        const [username, password] = tokens[i].split(':')
        result.authType = 'basic'
        result.authData = { username, password: password ?? '' }
      }
    } else if (token === '--auth-type') {
      i++
      if (i < tokens.length) {
        const authType = tokens[i].toLowerCase()
        if (authType === 'bearer') {
          result.authType = 'bearer'
          // Bearer token would come from --auth
          if (result.authData.username) {
            result.authData = { token: result.authData.username }
          }
        }
      }
    } else if (token === '--json' || token === '-j') {
      // Force JSON mode — no-op, handled by bodyType
    } else if (token === '--form' || token === '-f') {
      result.bodyType = 'form-data'
    } else if (token.includes('==')) {
      // Query parameter: key==value
      const eqIdx = token.indexOf('==')
      const key = token.slice(0, eqIdx)
      const value = token.slice(eqIdx + 2)
      result.params.push({ id: crypto.randomUUID(), key, value, enabled: true })
    } else if (token.includes(':=')) {
      // Raw JSON field: key:=value (non-string JSON value)
      const eqIdx = token.indexOf(':=')
      const key = token.slice(0, eqIdx)
      const value = token.slice(eqIdx + 2)
      jsonBodyFields[key] = value // raw value (number, boolean, array, object)
      hasJsonFields = true
    } else if (token.includes(':') && !token.startsWith('-') && !token.match(/^https?:\/\//)) {
      // Header: Key:Value  (but not a URL)
      const colonIdx = token.indexOf(':')
      const key = token.slice(0, colonIdx).trim()
      const value = token.slice(colonIdx + 1).trim()
      if (key) {
        result.headers.push({ id: crypto.randomUUID(), key, value, enabled: true })
      }
    } else if (token.includes('=') && !token.startsWith('-')) {
      // JSON body field: key=value (string value)
      const eqIdx = token.indexOf('=')
      const key = token.slice(0, eqIdx)
      const value = token.slice(eqIdx + 1)
      jsonBodyFields[key] = JSON.stringify(value) // wrap in quotes for JSON
      hasJsonFields = true
    } else if (token.startsWith('http://') || token.startsWith('https://') || token.startsWith(':')) {
      // URL — either full URL or shorthand like :3000/path
      if (token.startsWith(':')) {
        result.url = `http://localhost${token}`
      } else {
        result.url = token
      }
    } else if (!token.startsWith('-') && !result.url) {
      // Could be a URL without scheme
      result.url = token.includes('/') ? `https://${token}` : token
    }

    i++
  }

  // Build JSON body from collected fields
  if (hasJsonFields) {
    const bodyObj: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(jsonBodyFields)) {
      try {
        bodyObj[key] = JSON.parse(val)
      } catch {
        bodyObj[key] = val
      }
    }
    result.bodyContent = JSON.stringify(bodyObj, null, 2)
    if (result.bodyType === 'none') result.bodyType = 'json'
    if (result.method === 'GET' && !methods.includes(tokens[1]?.toUpperCase())) {
      result.method = 'POST'
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
      i++ // skip closing quote
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
