/** Output line from code execution */
export interface OutputLine {
  type: 'log' | 'warn' | 'error' | 'info' | 'result'
  content: string
}

/** Result of executing code */
export interface ExecutionResult {
  output: OutputLine[]
  /** Present when execution failed (e.g. timeout) */
  error?: string
  /** Execution duration in milliseconds */
  duration: number
}

/**
 * Language executor interface.
 *
 * To add a new language:
 * 1. Create a file implementing this interface (e.g. `python-executor.ts`)
 * 2. Register it in `executors/index.ts` with supported language aliases
 */
export interface LanguageExecutor {
  /** Unique identifier */
  id: string
  /** Human-readable name */
  label: string
  /** Execute code and return the result */
  execute(code: string): Promise<ExecutionResult>
  /** Optional cleanup of held resources */
  dispose?(): void
}
