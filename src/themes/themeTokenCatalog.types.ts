import type { ThemeColors } from './themes.types'

export type ThemeTokenGroup = 'surface' | 'text' | 'interactive' | 'feedback' | 'sidebar'

export interface ThemeTokenInfo {
  key: keyof ThemeColors
  label: string
  description: string
  group: ThemeTokenGroup
  exampleUsage: string
  /** Sidebar tokens are optional — they fall back to a non-sidebar token when blank. */
  optional?: boolean
}
