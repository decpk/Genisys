import type { Theme, ThemeColors } from '@/themes/themes.types'
import type { ThemeTokenGroup } from '@/themes/themeTokenCatalog.types'

export type ThemeEditorMode = 'create' | 'edit'

export interface ThemeEditorProps {
  mode: ThemeEditorMode
  initialTheme: Theme
  /** Called after the theme is successfully saved to disk. */
  onSaved: (theme: Theme) => void
  onCancel: () => void
}

export interface ThemeEditorDraft {
  id: string
  name: string
  isDark: boolean
  colors: ThemeColors
}

export interface ThemeEditorValidation {
  nameError: string | null
  isValid: boolean
}

export interface ColorTokenFieldProps {
  tokenKey: keyof ThemeColors
  label: string
  description: string
  exampleUsage: string
  optional: boolean
  /** Current hsl(...) string, or undefined for an optional token in fallback mode. */
  value: string | undefined
  onChange: (next: string | undefined) => void
}

export interface ColorTokenGroupSectionProps {
  group: ThemeTokenGroup
  groupLabel: string
  groupDescription: string
  draft: ThemeEditorDraft
  onChangeColor: (key: keyof ThemeColors, next: string | undefined) => void
  defaultExpanded?: boolean
}

export interface ThemePreviewProps {
  draft: ThemeEditorDraft
}
