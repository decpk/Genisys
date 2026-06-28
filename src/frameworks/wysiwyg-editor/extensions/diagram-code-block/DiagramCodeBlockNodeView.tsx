import { useState } from 'react'
import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { Code2, Eye } from 'lucide-react'

import { MermaidViewer } from '@/components/MermaidViewer'
import { RechartsViewer } from '@/components/ui/markdown-renderer/RechartsViewer'

/** Languages that get a rendered preview instead of a plain code block. */
const RENDERABLE_LANGUAGES = new Set(['mermaid', 'chart'])

/**
 * React NodeView for code blocks. For `mermaid` and `chart` languages it
 * renders a live preview (via the shared `MermaidViewer` / `RechartsViewer`)
 * while keeping the source editable behind an Edit/Preview toggle. All other
 * languages fall back to the standard editable code block so syntax
 * highlighting and editing behave exactly as before.
 *
 * The editable source (`NodeViewContent`) is always mounted so ProseMirror can
 * manage the document; it is merely hidden while previewing.
 */
export function DiagramCodeBlockNodeView({ node }: NodeViewProps): React.JSX.Element {
  const language = (node.attrs.language as string | null) ?? ''
  const isRenderable = RENDERABLE_LANGUAGES.has(language)
  const [showSource, setShowSource] = useState(false)

  if (!isRenderable) {
    return (
      <NodeViewWrapper as="pre">
        <NodeViewContent as="code" />
      </NodeViewWrapper>
    )
  }

  const source = node.textContent

  return (
    <NodeViewWrapper
      as="div"
      className="my-4 rounded-xl border border-border/50 bg-muted/20 overflow-hidden"
    >
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/30 bg-muted/30">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
          {language}
        </span>
        <button
          type="button"
          contentEditable={false}
          onClick={() => setShowSource((s) => !s)}
          className="flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer"
        >
          {showSource ? <Eye size={10} /> : <Code2 size={10} />}
          <span>{showSource ? 'Preview' : 'Edit'}</span>
        </button>
      </div>

      <pre className={showSource ? 'm-0' : 'hidden'}>
        <NodeViewContent as="code" />
      </pre>

      {!showSource && (
        <div contentEditable={false}>
          {language === 'mermaid' ? (
            <MermaidViewer chart={source} />
          ) : (
            <RechartsViewer spec={source} />
          )}
        </div>
      )}
    </NodeViewWrapper>
  )
}
