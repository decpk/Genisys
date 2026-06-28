import type { ParsedRequest } from './curl-parser'
import type { HttpMethod } from '../APIClient.types'

export function parseAxios(input: string): ParsedRequest {
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

  const normalized = input.replace(/\\\n/g, ' ').replace(/\\\r\n/g, ' ').trim()

  // Pattern 1: axios.method("url", ...)
  const shorthandMatch = normalized.match(
    /axios\s*\.\s*(get|post|put|patch|delete|head|options|request)\s*\(\s*["'`]([^"'`]+)["'`]/i
  )

  if (shorthandMatch) {
    const methodName = shorthandMatch[1].toLowerCase()
    result.method = (methodName === 'request' ? 'GET' : methodName.toUpperCase()) as HttpMethod
    result.url = shorthandMatch[2]

    // For post/put/patch, second arg is data, third is config
    // For get/delete/head/options, second arg is config
    const afterUrl = normalized.slice(normalized.indexOf(shorthandMatch[2]) + shorthandMatch[2].length)
    const hasData = ['post', 'put', 'patch'].includes(methodName)

    const objects = extractBracedObjects(afterUrl)

    if (hasData && objects.length >= 1) {
      // First object is data
      const dataStr = objects[0].trim()
      result.bodyContent = dataStr
      result.bodyType = isJsonString(dataStr) ? 'json' : 'raw'

      // Second object (if present) is config
      if (objects.length >= 2) {
        parseAxiosConfig(objects[1], result)
      }
    } else if (!hasData && objects.length >= 1) {
      // First object is config
      parseAxiosConfig(objects[0], result)
    }
  } else {
    // Pattern 2: axios({ method, url, ... })  or  axios(config)
    const configMatch = normalized.match(/axios\s*\(\s*\{/i)
    if (configMatch) {
      const objects = extractBracedObjects(normalized.slice(configMatch.index!))
      if (objects.length >= 1) {
        const configStr = objects[0]

        // Extract method
        const methodMatch = configStr.match(/method\s*:\s*["'`](\w+)["'`]/i)
        if (methodMatch) {
          result.method = methodMatch[1].toUpperCase() as HttpMethod
        }

        // Extract url
        const urlMatch = configStr.match(/url\s*:\s*["'`]([^"'`]+)["'`]/i)
        if (urlMatch) {
          result.url = urlMatch[1]
        }

        // Extract baseURL
        const baseUrlMatch = configStr.match(/baseURL\s*:\s*["'`]([^"'`]+)["'`]/i)
        if (baseUrlMatch && result.url && !result.url.startsWith('http')) {
          result.url = baseUrlMatch[1].replace(/\/$/, '') + '/' + result.url.replace(/^\//, '')
        }

        // Extract data
        const dataMatch = configStr.match(/data\s*:\s*(\{[^}]*\})/s)
        if (dataMatch) {
          result.bodyContent = dataMatch[1].trim()
          result.bodyType = 'json'
        } else {
          const dataStrMatch = configStr.match(/data\s*:\s*["'`]([^"'`]*)["'`]/s)
          if (dataStrMatch) {
            result.bodyContent = dataStrMatch[1]
            result.bodyType = isJsonString(dataStrMatch[1]) ? 'json' : 'raw'
          }
        }

        parseAxiosConfig(configStr, result)
      }
    }
  }

  // Extract Authorization header → auth fields
  extractAuth(result)

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

function parseAxiosConfig(configStr: string, result: ParsedRequest): void {
  // Extract headers
  const headersMatch = configStr.match(/headers\s*:\s*(\{[^}]*\})/s)
  if (headersMatch) {
    const pairRegex = /["']([^"']+)["']\s*:\s*["'`]([^"'`]*)["'`]/g
    let match: RegExpExecArray | null
    while ((match = pairRegex.exec(headersMatch[1])) !== null) {
      result.headers.push({
        id: crypto.randomUUID(),
        key: match[1],
        value: match[2],
        enabled: true,
      })
    }
  }

  // Extract params → query params
  const paramsMatch = configStr.match(/params\s*:\s*(\{[^}]*\})/s)
  if (paramsMatch) {
    const pairRegex = /["']?(\w+)["']?\s*:\s*["'`]?([^"'`,}]+)["'`]?/g
    let match: RegExpExecArray | null
    while ((match = pairRegex.exec(paramsMatch[1])) !== null) {
      if (match[1] !== 'params') {
        result.params.push({
          id: crypto.randomUUID(),
          key: match[1],
          value: match[2].trim(),
          enabled: true,
        })
      }
    }
  }

  // Extract auth: { username, password }
  const authMatch = configStr.match(/auth\s*:\s*\{([^}]*)\}/s)
  if (authMatch) {
    const usernameMatch = authMatch[1].match(/username\s*:\s*["'`]([^"'`]*)["'`]/)
    const passwordMatch = authMatch[1].match(/password\s*:\s*["'`]([^"'`]*)["'`]/)
    if (usernameMatch || passwordMatch) {
      result.authType = 'basic'
      result.authData = {
        username: usernameMatch?.[1] ?? '',
        password: passwordMatch?.[1] ?? '',
      }
    }
  }
}

function extractBracedObjects(input: string): string[] {
  const objects: string[] = []
  let depth = 0
  let start = -1
  for (let i = 0; i < input.length; i++) {
    if (input[i] === '{') {
      if (depth === 0) start = i
      depth++
    } else if (input[i] === '}') {
      depth--
      if (depth === 0 && start !== -1) {
        objects.push(input.slice(start, i + 1))
        start = -1
      }
    }
  }
  return objects
}

function extractAuth(result: ParsedRequest): void {
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
}

function isJsonString(str: string): boolean {
  const trimmed = str.trim()
  return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
}
