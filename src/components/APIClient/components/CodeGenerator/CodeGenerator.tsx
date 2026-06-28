import { useState, useMemo, useCallback, useEffect, lazy, Suspense } from 'react'
import { Code, Copy, Check, ChevronDown } from 'lucide-react'
import { Dropdown } from '@/components/ui/dropdown'
import type { DropdownItem } from '@/components/ui/dropdown'
import { Tooltip } from '@/components/Tooltip/Tooltip'
import { AppInlineLoader } from '@/components/AppLoader'
import { useThemeStore } from '@/store/theme-store'
import { useSettingsStore } from '@/store/settings-store'
import { THEMES } from '@/themes'
import { APP_MONACO_SCROLLBAR_OPTIONS, defineAppMonacoTheme } from '@/lib/monaco-theme'
import type { ApiRequestItem } from '../../APIClient.types'

const CODE_GEN_THEME_ID = 'api-client-code-gen'

const LazyEditor = lazy(() =>
  Promise.all([import('@monaco-editor/react'), import('monaco-editor')]).then(
    ([editorModule, monacoModule]) => {
      editorModule.loader.config({ monaco: monacoModule })
      return { default: editorModule.default }
    },
  ),
)

type CodeFormat = 'curl' | 'fetch' | 'axios' | 'python' | 'powershell' | 'httpie' | 'go'

const FORMAT_LABELS: Record<CodeFormat, string> = {
  curl: 'cURL',
  fetch: 'JavaScript Fetch',
  axios: 'Axios',
  python: 'Python Requests',
  powershell: 'PowerShell',
  httpie: 'HTTPie',
  go: 'Go',
}

function generateCurl(req: ApiRequestItem): string {
  const parts = [`curl -X ${req.method}`]
  parts.push(`  '${req.url}'`)
  const enabledHeaders = req.headers.filter((h) => h.enabled && h.key)
  for (const h of enabledHeaders) {
    parts.push(`  -H '${h.key}: ${h.value}'`)
  }
  if (req.authType === 'bearer' && req.authData.token) {
    parts.push(`  -H 'Authorization: Bearer ${req.authData.token}'`)
  } else if (req.authType === 'basic' && req.authData.username) {
    parts.push(`  -u '${req.authData.username}:${req.authData.password ?? ''}'`)
  }
  if (req.bodyType !== 'none' && req.bodyContent && req.method !== 'GET' && req.method !== 'HEAD') {
    parts.push(`  -d '${req.bodyContent.replace(/'/g, "'\\''")}'`)
  }
  return parts.join(' \\\n')
}

function generateFetch(req: ApiRequestItem): string {
  const headers: Record<string, string> = {}
  req.headers.filter((h) => h.enabled && h.key).forEach((h) => { headers[h.key] = h.value })
  if (req.authType === 'bearer' && req.authData.token) headers['Authorization'] = `Bearer ${req.authData.token}`
  if (req.authType === 'basic' && req.authData.username) {
    headers['Authorization'] = `Basic ${btoa(`${req.authData.username}:${req.authData.password ?? ''}`)}`
  }

  const opts: string[] = [`  method: '${req.method}',`]
  if (Object.keys(headers).length > 0) {
    opts.push(`  headers: ${JSON.stringify(headers, null, 4).split('\n').join('\n  ')},`)
  }
  if (req.bodyType !== 'none' && req.bodyContent && req.method !== 'GET' && req.method !== 'HEAD') {
    const bodyStr = req.bodyType === 'json' ? `JSON.stringify(${req.bodyContent})` : `'${req.bodyContent}'`
    opts.push(`  body: ${bodyStr},`)
  }

  return `const response = await fetch('${req.url}', {\n${opts.join('\n')}\n})\n\nconst data = await response.json()\nconsole.log(data)`
}

function generateAxios(req: ApiRequestItem): string {
  const headers: Record<string, string> = {}
  req.headers.filter((h) => h.enabled && h.key).forEach((h) => { headers[h.key] = h.value })
  if (req.authType === 'bearer' && req.authData.token) headers['Authorization'] = `Bearer ${req.authData.token}`

  const parts = [`const { data } = await axios.${req.method.toLowerCase()}('${req.url}'`]
  if (req.bodyType !== 'none' && req.bodyContent && req.method !== 'GET') {
    parts[0] += `, ${req.bodyContent}`
  }
  if (Object.keys(headers).length > 0) {
    parts[0] += `, {\n  headers: ${JSON.stringify(headers, null, 4).split('\n').join('\n  ')}\n}`
  }
  parts[0] += ')'
  return parts.join('\n')
}

function generatePython(req: ApiRequestItem): string {
  const lines = ['import requests', '']
  const headers: Record<string, string> = {}
  req.headers.filter((h) => h.enabled && h.key).forEach((h) => { headers[h.key] = h.value })
  if (req.authType === 'bearer' && req.authData.token) headers['Authorization'] = `Bearer ${req.authData.token}`

  if (Object.keys(headers).length > 0) {
    lines.push(`headers = ${JSON.stringify(headers, null, 4)}`)
    lines.push('')
  }

  let call = `response = requests.${req.method.toLowerCase()}('${req.url}'`
  if (Object.keys(headers).length > 0) call += ', headers=headers'
  if (req.bodyType === 'json' && req.bodyContent) call += `, json=${req.bodyContent}`
  else if (req.bodyType !== 'none' && req.bodyContent) call += `, data='${req.bodyContent}'`
  if (req.authType === 'basic' && req.authData.username) {
    call += `, auth=('${req.authData.username}', '${req.authData.password ?? ''}')`
  }
  call += ')'
  lines.push(call, '', 'print(response.json())')
  return lines.join('\n')
}

function generatePowershell(req: ApiRequestItem): string {
  const parts = [`Invoke-RestMethod -Uri '${req.url}' -Method ${req.method}`]
  const headers: Record<string, string> = {}
  req.headers.filter((h) => h.enabled && h.key).forEach((h) => { headers[h.key] = h.value })
  if (req.authType === 'bearer' && req.authData.token) headers['Authorization'] = `Bearer ${req.authData.token}`
  if (Object.keys(headers).length > 0) {
    const h = Object.entries(headers).map(([k, v]) => `'${k}'='${v}'`).join('; ')
    parts.push(`  -Headers @{${h}}`)
  }
  if (req.bodyType !== 'none' && req.bodyContent) {
    parts.push(`  -Body '${req.bodyContent}'`)
    if (req.bodyType === 'json') parts.push(`  -ContentType 'application/json'`)
  }
  return parts.join(' `\n')
}

function generateHttpie(req: ApiRequestItem): string {
  const parts = [`http ${req.method} '${req.url}'`]
  req.headers.filter((h) => h.enabled && h.key).forEach((h) => {
    parts.push(`  '${h.key}:${h.value}'`)
  })
  if (req.authType === 'bearer' && req.authData.token) {
    parts.push(`  'Authorization:Bearer ${req.authData.token}'`)
  }
  return parts.join(' \\\n')
}

function generateGo(req: ApiRequestItem): string {
  const lines = [
    'package main',
    '',
    'import (',
    '    "fmt"',
    '    "io"',
    '    "net/http"',
  ]
  if (req.bodyType !== 'none' && req.bodyContent) lines.push('    "strings"')
  lines.push(')', '')

  lines.push('func main() {')
  if (req.bodyType !== 'none' && req.bodyContent && req.method !== 'GET') {
    lines.push(`    body := strings.NewReader(\`${req.bodyContent}\`)`)
    lines.push(`    req, _ := http.NewRequest("${req.method}", "${req.url}", body)`)
  } else {
    lines.push(`    req, _ := http.NewRequest("${req.method}", "${req.url}", nil)`)
  }
  req.headers.filter((h) => h.enabled && h.key).forEach((h) => {
    lines.push(`    req.Header.Set("${h.key}", "${h.value}")`)
  })
  if (req.authType === 'bearer' && req.authData.token) {
    lines.push(`    req.Header.Set("Authorization", "Bearer ${req.authData.token}")`)
  }
  lines.push('', '    resp, _ := http.DefaultClient.Do(req)')
  lines.push('    defer resp.Body.Close()')
  lines.push('    data, _ := io.ReadAll(resp.Body)')
  lines.push('    fmt.Println(string(data))')
  lines.push('}')
  return lines.join('\n')
}

const GENERATORS: Record<CodeFormat, (req: ApiRequestItem) => string> = {
  curl: generateCurl,
  fetch: generateFetch,
  axios: generateAxios,
  python: generatePython,
  powershell: generatePowershell,
  httpie: generateHttpie,
  go: generateGo,
}

const FORMAT_LANGUAGE: Record<CodeFormat, string> = {
  curl: 'shell',
  fetch: 'javascript',
  axios: 'javascript',
  python: 'python',
  powershell: 'powershell',
  httpie: 'shell',
  go: 'go',
}

interface CodeGeneratorProps {
  request: ApiRequestItem
}

export function CodeGenerator(props: CodeGeneratorProps): React.JSX.Element {
  const { request } = props
  const [format, setFormat] = useState<CodeFormat>('curl')
  const [copied, setCopied] = useState(false)

  const code = useMemo(() => GENERATORS[format](request), [request, format])

  const activeThemeId = useThemeStore((s) => s.activeThemeId)
  const editorFontSize = useSettingsStore((s) => s.editorFontSize)
  const appTheme = useMemo(
    () => THEMES.find((t) => t.id === activeThemeId),
    [activeThemeId],
  )

  useEffect(() => {
    if (appTheme) defineAppMonacoTheme(CODE_GEN_THEME_ID, appTheme)
  }, [appTheme])

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  const items: DropdownItem[] = useMemo(
    () =>
      (Object.keys(FORMAT_LABELS) as CodeFormat[]).map((f) => ({
        key: f,
        label: FORMAT_LABELS[f],
        active: f === format,
        onSelect: () => setFormat(f),
      })),
    [format]
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/20">
        <div className="flex items-center gap-2">
          <Code size={14} className="text-muted-foreground" />
          <span className="text-xs font-medium">Code Generation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Dropdown
            items={items}
            openOn="click"
            align="right"
            showCheck
            menuWidth="180px"
            trigger={
              <button className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-muted/20 hover:bg-muted/40 transition-colors">
                {FORMAT_LABELS[format]}
                <ChevronDown size={10} className="opacity-50" />
              </button>
            }
          />
          <Tooltip content={copied ? 'Copied!' : 'Copy'} side="bottom">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Code output */}
      <div className="flex-1 min-h-0" data-selection-toolbar>
        <Suspense
          fallback={<AppInlineLoader message="Loading editor..." size={14} className="h-full" />}
        >
          <LazyEditor
            value={code}
            language={FORMAT_LANGUAGE[format]}
            theme={CODE_GEN_THEME_ID}
            options={{
              readOnly: true,
              domReadOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: editorFontSize,
              lineNumbers: 'off',
              renderLineHighlight: 'none',
              contextmenu: false,
              folding: false,
              wordWrap: 'on',
              scrollbar: APP_MONACO_SCROLLBAR_OPTIONS,
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,
              overviewRulerBorder: false,
              padding: { top: 12, bottom: 12 },
            }}
          />
        </Suspense>
      </div>
    </div>
  )
}
