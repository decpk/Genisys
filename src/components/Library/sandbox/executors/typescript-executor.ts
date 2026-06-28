import { transform } from 'sucrase'
import type { LanguageExecutor } from '../types'
import { executeJS } from './javascript-executor'

export const typescriptExecutor: LanguageExecutor = {
  id: 'typescript',
  label: 'TypeScript',

  async execute(code: string) {
    try {
      const { code: jsCode } = transform(code, {
        transforms: ['typescript'],
        disableESTransforms: true,
      })
      return executeJS(jsCode)
    } catch (err) {
      return {
        output: [{ type: 'error' as const, content: err instanceof Error ? err.message : String(err) }],
        duration: 0,
      }
    }
  },
}
