import type { PmPrompt } from '@/store/prompt-manager-store'

import { scanForApiKeys } from './scanForApiKeys'
import { findEnvFiles } from './findEnvFiles'
import { findWorldWritableFiles } from './findWorldWritableFiles'
import { detectCredentialPatterns } from './detectCredentialPatterns'

export { scanForApiKeys, findEnvFiles, findWorldWritableFiles, detectCredentialPatterns }

export const SECURITY_PROMPTS: PmPrompt[] = [
  scanForApiKeys,
  findEnvFiles,
  findWorldWritableFiles,
  detectCredentialPatterns,
]
