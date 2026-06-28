import { memo, useState, type ComponentPropsWithoutRef } from 'react'
import { Copy, Check } from 'lucide-react'

import { MermaidViewer } from '@/components/MermaidViewer'

import { HighlightedCode } from './HighlightedCode'
import { InlineCode } from './InlineCode'
import { RechartsViewer } from './RechartsViewer'

export const CodeBlock = memo(function CodeBlock({
  children,
  className,
  isStreaming,
  ...props
}: ComponentPropsWithoutRef<'code'> & { isStreaming?: boolean }): React.JSX.Element {
  const match = /language-(\w+)/.exec(className || '')
  const content = String(children).replace(/\n$/, '')
  const isBlock = match || content.includes('\n')

  const [copied, setCopied] = useState(false)

  if (match?.[1] === 'mermaid' && !isStreaming) {
    return <MermaidViewer chart={content} />
  }

  if (match?.[1] === 'chart' && !isStreaming) {
    return <RechartsViewer spec={content} />
  }

  if (!isBlock) {
    return <InlineCode {...props}>{children}</InlineCode>
  }

  const lang = match?.[1] ?? 'text'

  const handleCopy = (): void => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group/code relative my-4 rounded-xl border border-border/50 bg-muted/30 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-muted/40">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
          {lang}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer"
        >
          {copied ? (
            <Check size={10} className="text-success" />
          ) : (
            <Copy size={10} />
          )}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      {lang !== "text" ? (
        <HighlightedCode code={content} lang={lang} />
      ) : (
        <pre className="overflow-x-auto p-4 !m-0 !bg-transparent !border-0 !rounded-none">
          <code className="text-sm leading-6">{children}</code>
        </pre>
      )}
    </div>
  );
})
