import type { LanguageExecutor, ExecutionResult, OutputLine } from '../types'

const TIMEOUT_MS = 5_000

export function formatValue(v: unknown): string {
  if (v === null) return 'null'
  if (v === undefined) return 'undefined'
  if (typeof v === 'function') return v.toString()
  if (typeof v === 'symbol') return v.toString()
  if (v instanceof Error) return v.stack || v.message
  if (typeof v === 'object') {
    try { return JSON.stringify(v, null, 2) } catch { return String(v) }
  }
  return String(v)
}

/**
 * Execute a JS code string with console capturing and timeout.
 * Shared by JS, TS, and JSX/TSX executors.
 */
export function executeJS(code: string): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const output: OutputLine[] = []
    const start = performance.now()

    const push = (type: OutputLine['type'], args: unknown[]) => {
      output.push({ type, content: args.map(formatValue).join(' ') })
    }

    const fakeConsole = {
      log: (...args: unknown[]) => push('log', args),
      warn: (...args: unknown[]) => push('warn', args),
      error: (...args: unknown[]) => push('error', args),
      info: (...args: unknown[]) => push('info', args),
      table: (data: unknown) => push('log', [data]),
      dir: (data: unknown) => push('log', [data]),
      debug: (...args: unknown[]) => push('log', args),
      clear: () => { output.length = 0 },
    }

    let timer: ReturnType<typeof setTimeout> | null = null
    let finished = false

    const finish = (error?: string) => {
      if (finished) return
      finished = true
      if (timer) clearTimeout(timer)
      resolve({ output, error, duration: performance.now() - start })
    }

    timer = setTimeout(() => finish('Execution timed out (5 s)'), TIMEOUT_MS)

    try {
      const fn = new Function('console', `"use strict";\nreturn (async () => {\n${code}\n})()`)
      const resultPromise = fn(fakeConsole)

      Promise.resolve(resultPromise)
        .then((result: unknown) => {
          if (result !== undefined) {
            output.push({ type: 'result', content: formatValue(result) })
          }
          finish()
        })
        .catch((err: unknown) => {
          output.push({ type: 'error', content: err instanceof Error ? err.message : String(err) })
          finish()
        })
    } catch (err) {
      output.push({ type: 'error', content: err instanceof Error ? err.message : String(err) })
      finish()
    }
  })
}
