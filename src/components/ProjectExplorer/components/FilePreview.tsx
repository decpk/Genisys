import { useMemo } from 'react'

import { MarkdownRenderer } from '@/components/ui/markdown-renderer'

interface FilePreviewProps {
  path: string
  content: string
}

const PREVIEWABLE_EXTENSIONS = new Set([
  'md',
  'markdown',
  'json',
  'yaml',
  'yml',
  'html',
  'htm',
  'svg',
  'csv',
  'tsv',
  'xml'
])

export function isPreviewable(path: string): boolean {
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  return PREVIEWABLE_EXTENSIONS.has(ext)
}

export function FilePreview({ path, content }: FilePreviewProps): React.JSX.Element {
  const ext = path.split('.').pop()?.toLowerCase() ?? ''

  switch (ext) {
    case 'md':
    case 'markdown':
      return <MarkdownPreview content={content} />
    case 'json':
      return <JsonPreview content={content} />
    case 'yaml':
    case 'yml':
      return <YamlPreview content={content} />
    case 'html':
    case 'htm':
      return <HtmlPreview content={content} />
    case 'svg':
      return <SvgPreview content={content} />
    case 'csv':
    case 'tsv':
      return <CsvPreview content={content} separator={ext === 'tsv' ? '\t' : ','} />
    case 'xml':
      return <XmlPreview content={content} />
    default:
      return (
        <div className="flex items-center justify-center flex-1 text-muted-foreground text-sm">
          Preview not available for this file type
        </div>
      )
  }
}

function MarkdownPreview({ content }: { content: string }): React.JSX.Element {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      <MarkdownRenderer content={content} />
    </div>
  )
}

function JsonPreview({ content }: { content: string }): React.JSX.Element {
  const formatted = useMemo(() => {
    try {
      return JSON.stringify(JSON.parse(content), null, 2)
    } catch {
      return null
    }
  }, [content])

  if (!formatted) {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="rounded-md bg-destructive/10 text-destructive text-sm px-4 py-3">
          Invalid JSON — could not parse
        </div>
        <pre className="mt-4 text-xs text-foreground whitespace-pre-wrap break-all">
          {content}
        </pre>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <JsonTree content={content} />
    </div>
  )
}

function JsonTree({ content }: { content: string }): React.JSX.Element {
  const parsed = useMemo(() => {
    try {
      return JSON.parse(content)
    } catch {
      return null
    }
  }, [content])

  if (parsed === null) return <></>

  return (
    <div className="px-2 py-2 text-sm font-mono">
      <JsonValue value={parsed} depth={0} />
    </div>
  )
}

function JsonValue({ value, depth }: { value: unknown; depth: number }): React.JSX.Element {
  if (value === null) return <span className="text-orange-400">null</span>
  if (typeof value === 'boolean')
    return <span className="text-orange-400">{value ? 'true' : 'false'}</span>
  if (typeof value === 'number') return <span className="text-green-400">{value}</span>
  if (typeof value === 'string') return <span className="text-yellow-400">&quot;{value}&quot;</span>

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-muted-foreground">{'[]'}</span>
    return (
      <div>
        <span className="text-muted-foreground">{'['}</span>
        <div style={{ paddingLeft: 12 }}>
          {value.map((item, i) => (
            <div key={i} className="flex">
              <JsonValue value={item} depth={depth + 1} />
              {i < value.length - 1 && <span className="text-muted-foreground">,</span>}
            </div>
          ))}
        </div>
        <span className="text-muted-foreground">{']'}</span>
      </div>
    )
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return <span className="text-muted-foreground">{'{}'}</span>
    return (
      <div>
        <span className="text-muted-foreground">{'{'}</span>
        <div style={{ paddingLeft: 12 }}>
          {entries.map(([key, val], i) => (
            <div key={key} className="flex">
              <span className="text-info">&quot;{key}&quot;</span>
              <span className="text-muted-foreground mr-1">:</span>
              <JsonValue value={val} depth={depth + 1} />
              {i < entries.length - 1 && <span className="text-muted-foreground">,</span>}
            </div>
          ))}
        </div>
        <span className="text-muted-foreground">{'}'}</span>
      </div>
    )
  }

  return <span>{String(value)}</span>
}

function YamlPreview({ content }: { content: string }): React.JSX.Element {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      <pre className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
        {content.split("\n").map((line, i) => {
          const keyMatch = line.match(/^(\s*)([\w.-]+)(:)(.*)$/);
          if (keyMatch) {
            const [, indent, key, colon, rest] = keyMatch;
            return (
              <div key={i}>
                {indent}
                <span className="text-info">{key}</span>
                <span className="text-muted-foreground">{colon}</span>
                {rest}
              </div>
            );
          }
          const commentMatch = line.match(/^(\s*)(#.*)$/);
          if (commentMatch) {
            return (
              <div key={i}>
                {commentMatch[1]}
                <span className="text-muted-foreground">{commentMatch[2]}</span>
              </div>
            );
          }
          return <div key={i}>{line}</div>;
        })}
      </pre>
    </div>
  );
}

function HtmlPreview({ content }: { content: string }): React.JSX.Element {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      <div className="rounded-md border border-border/20 bg-background p-4">
        <div
          className="text-sm text-foreground"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
        />
      </div>
    </div>
  )
}

/** Strip script tags and event handlers for basic safety */
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\bon\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\bon\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript\s*:/gi, '')
}

function SvgPreview({ content }: { content: string }): React.JSX.Element {
  return (
    <div className="flex-1 overflow-y-auto flex items-center justify-center p-8">
      <div
        className="max-w-full max-h-full [&>svg]:max-w-full [&>svg]:max-h-[60vh] [&>svg]:w-auto [&>svg]:h-auto"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
      />
    </div>
  )
}

function CsvPreview({
  content,
  separator
}: {
  content: string
  separator: string
}): React.JSX.Element {
  const rows = useMemo(() => {
    const lines = content.split('\n').filter((l) => l.trim())
    return lines.map((line) => line.split(separator))
  }, [content, separator])

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center flex-1 text-muted-foreground text-sm">
        Empty file
      </div>
    )
  }

  const [header, ...body] = rows

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0">
          <tr>
            {header.map((cell, i) => (
              <th
                key={i}
                className="border border-border/20 bg-muted px-3 py-1.5 text-left font-medium text-foreground whitespace-nowrap"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri} className="hover:bg-secondary">
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="border border-border/20 px-3 py-1.5 text-foreground whitespace-nowrap"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function XmlPreview({ content }: { content: string }): React.JSX.Element {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      <pre className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
        {content.split("\n").map((line, i) => {
          const tagMatch = line.match(
            /^(\s*)(<\/?)(\w[\w.-]*)([^>]*?)(\/?>)(.*)$/,
          );
          if (tagMatch) {
            const [, indent, open, tag, attrs, close, rest] = tagMatch;
            return (
              <div key={i}>
                {indent}
                <span className="text-muted-foreground">{open}</span>
                <span className="text-info">{tag}</span>
                <span className="text-yellow-400">{attrs}</span>
                <span className="text-muted-foreground">{close}</span>
                {rest}
              </div>
            );
          }
          const commentMatch = line.match(/^(\s*)(<!--.*?-->)(.*)$/);
          if (commentMatch) {
            return (
              <div key={i}>
                {commentMatch[1]}
                <span className="text-muted-foreground">{commentMatch[2]}</span>
                {commentMatch[3]}
              </div>
            );
          }
          return <div key={i}>{line}</div>;
        })}
      </pre>
    </div>
  );
}
