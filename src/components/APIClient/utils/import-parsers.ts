import type { ParsedRequest } from './curl-parser'

// ─── Import Format Types ─────────────────────────────────────────

export type ImportFormat =
  | 'curl'
  | 'raw-http'
  | 'fetch'
  | 'axios'
  | 'httpie'
  | 'powershell'
  | 'python-requests'
  | 'wget'

export interface ImportFormatMeta {
  key: ImportFormat
  label: string
  placeholder: string
}

// ─── Format Metadata ─────────────────────────────────────────────

export const IMPORT_FORMATS: ImportFormatMeta[] = [
  {
    key: 'curl',
    label: 'cURL',
    placeholder: `curl -X POST https://api.example.com/data \\
  -H "Content-Type: application/json" \\
  -d '{"key": "value"}'`,
  },
  {
    key: 'raw-http',
    label: 'Raw HTTP',
    placeholder: `GET /api/users HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer token123`,
  },
  {
    key: 'fetch',
    label: 'Fetch (JavaScript)',
    placeholder: `fetch("https://api.example.com/data", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ key: "value" })
})`,
  },
  {
    key: 'axios',
    label: 'Axios (JavaScript)',
    placeholder: `axios.post("https://api.example.com/data", {
  key: "value"
}, {
  headers: { "Content-Type": "application/json" }
})`,
  },
  {
    key: 'httpie',
    label: 'HTTPie',
    placeholder: `http POST https://api.example.com/data \\
  Content-Type:application/json \\
  key=value`,
  },
  {
    key: 'powershell',
    label: 'PowerShell',
    placeholder: `Invoke-WebRequest -Uri "https://api.example.com/data" \\
  -Method POST \\
  -Headers @{ "Content-Type" = "application/json" } \\
  -Body '{"key": "value"}'`,
  },
  {
    key: 'python-requests',
    label: 'Python Requests',
    placeholder: `requests.post("https://api.example.com/data",
  headers={"Content-Type": "application/json"},
  json={"key": "value"})`,
  },
  {
    key: 'wget',
    label: 'Wget',
    placeholder: `wget --method=POST \\
  --header="Content-Type: application/json" \\
  --body-data='{"key": "value"}' \\
  "https://api.example.com/data"`,
  },
]

// ─── Format Auto-Detection ───────────────────────────────────────

export function detectImportFormat(input: string): ImportFormat | null {
  const trimmed = input.trimStart()
  if (!trimmed) return null

  if (/^curl\s/i.test(trimmed)) return 'curl'
  if (/^fetch\s*\(/i.test(trimmed)) return 'fetch'
  if (/^axios[.(]/i.test(trimmed)) return 'axios'
  if (/^(http|https)\s+/i.test(trimmed) || /^http\s/i.test(trimmed)) return 'httpie'
  if (/^Invoke-(Web|Rest)Request/i.test(trimmed)) return 'powershell'
  if (/^requests\./i.test(trimmed)) return 'python-requests'
  if (/^wget\s/i.test(trimmed)) return 'wget'
  if (/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+\S+\s+HTTP\//i.test(trimmed)) return 'raw-http'

  return null
}

// ─── Parser Dispatcher ───────────────────────────────────────────

export async function parseImport(format: ImportFormat, input: string): Promise<ParsedRequest> {
  switch (format) {
    case 'curl': {
      const { parseCurl } = await import('./curl-parser')
      return parseCurl(input)
    }
    case 'raw-http': {
      const { parseRawHttp } = await import('./raw-http-parser')
      return parseRawHttp(input)
    }
    case 'fetch': {
      const { parseFetch } = await import('./fetch-parser')
      return parseFetch(input)
    }
    case 'axios': {
      const { parseAxios } = await import('./axios-parser')
      return parseAxios(input)
    }
    case 'httpie': {
      const { parseHttpie } = await import('./httpie-parser')
      return parseHttpie(input)
    }
    case 'powershell': {
      const { parsePowerShell } = await import('./powershell-parser')
      return parsePowerShell(input)
    }
    case 'python-requests': {
      const { parsePythonRequests } = await import('./python-requests-parser')
      return parsePythonRequests(input)
    }
    case 'wget': {
      const { parseWget } = await import('./wget-parser')
      return parseWget(input)
    }
  }
}
