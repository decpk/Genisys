import type { ParsedRequest } from './curl-parser'
import type { HttpMethod } from '../APIClient.types'

export function parsePowerShell(input: string): ParsedRequest {
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

  // Normalize: join backtick-newline continuations (PowerShell uses ` for line continuation)
  // Also handle backslash continuations
  const normalized = input
    .replace(/`\r?\n/g, ' ')
    .replace(/\\\r?\n/g, ' ')
    .trim()

  // Detect the cmdlet
  const cmdletMatch = normalized.match(/\b(Invoke-WebRequest|Invoke-RestMethod|iwr|irm)\b/i)
  if (!cmdletMatch) {
    // Try to extract anything useful anyway
    return result
  }

  // Extract -Uri parameter
  const uriMatch = normalized.match(/-Uri\s+["']?([^\s"']+)["']?/i)
  if (uriMatch) {
    result.url = uriMatch[1]
  }

  // Extract -Method parameter
  const methodMatch = normalized.match(/-Method\s+["']?(\w+)["']?/i)
  if (methodMatch) {
    result.method = methodMatch[1].toUpperCase() as HttpMethod
  }

  // Extract -ContentType parameter
  const contentTypeMatch = normalized.match(/-ContentType\s+["']([^"']+)["']/i)
  if (contentTypeMatch) {
    result.headers.push({
      id: crypto.randomUUID(),
      key: 'Content-Type',
      value: contentTypeMatch[1],
      enabled: true,
    })
  }

  // Extract -Headers @{...} — PowerShell hashtable syntax
  const headersMatch = normalized.match(/-Headers\s+@\{([^}]*)\}/i)
  if (headersMatch) {
    parseHashtable(headersMatch[1], result.headers)
  }

  // Extract -Body parameter — can be a string or a hashtable
  const bodyStringMatch = normalized.match(/-Body\s+['"]([^'"]*)['"]/i)
  if (bodyStringMatch) {
    result.bodyContent = bodyStringMatch[1]
    result.bodyType = isJsonString(bodyStringMatch[1]) ? 'json' : 'raw'
    if (result.method === 'GET') result.method = 'POST'
  } else {
    // Try hashtable body: -Body @{...}
    const bodyHashMatch = normalized.match(/-Body\s+@\{([^}]*)\}/i)
    if (bodyHashMatch) {
      const fields = parseHashtableToObject(bodyHashMatch[1])
      result.bodyContent = JSON.stringify(fields, null, 2)
      result.bodyType = 'json'
      if (result.method === 'GET') result.method = 'POST'
    } else {
      // Try here-string or ConvertTo-Json
      const bodyConvertMatch = normalized.match(/-Body\s+\(([^)]+)\)/i)
      if (bodyConvertMatch) {
        // Could be: (ConvertTo-Json @{...}) or ($var | ConvertTo-Json)
        const innerHashMatch = bodyConvertMatch[1].match(/@\{([^}]*)\}/)
        if (innerHashMatch) {
          const fields = parseHashtableToObject(innerHashMatch[1])
          result.bodyContent = JSON.stringify(fields, null, 2)
          result.bodyType = 'json'
          if (result.method === 'GET') result.method = 'POST'
        }
      }
    }
  }

  // Extract -Authentication Bearer and -Token
  const authBearerMatch = normalized.match(/-Authentication\s+Bearer/i)
  if (authBearerMatch) {
    const tokenMatch = normalized.match(/-Token\s+\(ConvertTo-SecureString\s+["']([^"']+)["']/i)
    if (tokenMatch) {
      result.authType = 'bearer'
      result.authData = { token: tokenMatch[1] }
    }
  }

  // Extract -Credential (basic auth — can't fully parse PSCredential, just note it)
  const credentialMatch = normalized.match(/-Credential\s+["']?([^"'\s]+):([^"'\s]+)["']?/i)
  if (credentialMatch) {
    result.authType = 'basic'
    result.authData = { username: credentialMatch[1], password: credentialMatch[2] }
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

function parseHashtable(content: string, headers: ParsedRequest['headers']): void {
  // PowerShell hashtable entries: "Key" = "Value" or Key = "Value" separated by ; or newline
  const entries = content.split(/[;\n]/)
  for (const entry of entries) {
    const match = entry.match(/["']?([^"'=]+)["']?\s*=\s*["']([^"']*)['"]/);
    if (match) {
      headers.push({
        id: crypto.randomUUID(),
        key: match[1].trim(),
        value: match[2].trim(),
        enabled: true,
      })
    }
  }
}

function parseHashtableToObject(content: string): Record<string, string> {
  const obj: Record<string, string> = {}
  const entries = content.split(/[;\n]/)
  for (const entry of entries) {
    const match = entry.match(/["']?([^"'=]+)["']?\s*=\s*["']?([^"';]*)["']?/)
    if (match) {
      obj[match[1].trim()] = match[2].trim()
    }
  }
  return obj
}

function isJsonString(str: string): boolean {
  const trimmed = str.trim()
  return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
}
