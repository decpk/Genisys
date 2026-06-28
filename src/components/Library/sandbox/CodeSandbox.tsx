import { useState, useEffect, useCallback, useRef } from 'react'
import { RotateCcw, X, Terminal } from 'lucide-react'
import { getExecutor } from './executor-registry'
import type { OutputLine, ExecutionResult } from './types'

interface CodeSandboxProps {
  code: string
  lang: string
  onClose: () => void
}

const OUTPUT_COLORS: Record<OutputLine['type'], string> = {
  log: 'text-foreground/80',
  warn: 'text-amber-500',
  error: 'text-red-400',
  info: 'text-blue-400',
  result: 'text-emerald-400',
}

const REACT_LANGS = new Set(['jsx', 'tsx'])

export function CodeSandbox({ code, lang, onClose }: CodeSandboxProps): React.JSX.Element {
  const [output, setOutput] = useState<OutputLine[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [duration, setDuration] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const runIdRef = useRef(0)
  const hasRun = useRef(false)
  const isReact = REACT_LANGS.has(lang.toLowerCase())

  const runCode = useCallback(async () => {
    const executor = getExecutor(lang)
    if (!executor) return

    const currentRunId = ++runIdRef.current
    setIsRunning(true)
    setOutput([])
    setError(null)
    setDuration(null)

    // Clear previous preview
    if (previewRef.current) previewRef.current.innerHTML = ''

    try {
      const result: ExecutionResult & { _container?: HTMLDivElement } = await executor.execute(code)
      if (runIdRef.current !== currentRunId) return
      setOutput(result.output)
      setDuration(result.duration)
      if (result.error) setError(result.error)

      // Mount rendered container for React executor
      if (result._container && previewRef.current) {
        previewRef.current.appendChild(result._container)
      }
    } catch (err) {
      if (runIdRef.current !== currentRunId) return
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      if (runIdRef.current === currentRunId) setIsRunning(false)
    }
  }, [code, lang])

  // Auto-run on mount
  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true
      runCode()
    }
  }, [runCode])

  const hasOutput = output.length > 0 || error

  return (
    <div className="border-t border-border/30">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-muted/20">
        <div className="flex items-center gap-1.5">
          <Terminal size={10} className="text-muted-foreground/50" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50">
            {isReact ? "Preview" : "Output"}
          </span>
          {duration !== null && (
            <span className="text-[10px] text-muted-foreground/30 ml-2">
              {duration < 1 ? "<1" : duration.toFixed(0)}ms
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCcw size={10} />
            <span>Re-run</span>
          </button>
          <button
            onClick={onClose}
            className="flex items-center text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer ml-1"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* React preview iframe container */}
      {isReact && (
        <div
          ref={previewRef}
          className="bg-background rounded-b-lg overflow-hidden"
        />
      )}

      {/* Console output body */}
      <div className="px-4 py-3 text-[13px] leading-6 max-h-60 overflow-y-auto bg-background/80">
        {isRunning ? (
          <div className="flex items-center gap-2 text-muted-foreground/50">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-breathe" />
            <span className="text-[12px]">Running…</span>
          </div>
        ) : !hasOutput ? (
          <span className="text-[12px] text-muted-foreground/30 italic">
            No output
          </span>
        ) : (
          <>
            {output.map((line, i) => (
              <div
                key={i}
                className={`${OUTPUT_COLORS[line.type]} whitespace-pre-wrap break-all${line.type === "result" ? " font-mono" : ""}`}
              >
                {line.type === "result" && (
                  <span className="text-muted-foreground/40 mr-1">{"← "}</span>
                )}
                {line.content}
              </div>
            ))}
            {error && <div className="text-red-400 mt-1">⚠ {error}</div>}
          </>
        )}
      </div>
    </div>
  );
}
