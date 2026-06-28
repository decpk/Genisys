/**
 * Auto-register all built-in language executors.
 *
 * To add a new language:
 * 1. Create `my-language-executor.ts` exporting a `LanguageExecutor`.
 * 2. Import it here and call `registerExecutor` with language aliases.
 */
import { registerExecutor } from '../executor-registry'
import { executeJS } from './javascript-executor'
import { typescriptExecutor } from './typescript-executor'
import { reactExecutor } from './react-executor'

// JavaScript
registerExecutor(['javascript', 'js'], {
  id: 'javascript',
  label: 'JavaScript',
  execute: executeJS,
})

// TypeScript
registerExecutor(['typescript', 'ts'], typescriptExecutor)

// JSX / TSX (React)
registerExecutor(['jsx', 'tsx'], reactExecutor)
