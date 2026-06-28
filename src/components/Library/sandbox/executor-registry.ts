import type { LanguageExecutor } from './types'

const executors = new Map<string, LanguageExecutor>()

/**
 * Register an executor for one or more language identifiers.
 *
 * ```ts
 * registerExecutor(['javascript', 'js'], javascriptExecutor)
 * ```
 */
export function registerExecutor(langIds: string[], executor: LanguageExecutor): void {
  for (const id of langIds) {
    executors.set(id.toLowerCase(), executor)
  }
}

/** Get the executor for a language (case-insensitive). */
export function getExecutor(lang: string): LanguageExecutor | undefined {
  return executors.get(lang.toLowerCase())
}

/** Check whether a language has a registered executor. */
export function isExecutable(lang: string): boolean {
  return executors.has(lang.toLowerCase())
}
