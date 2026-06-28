import type { Theme } from '@/themes'

export interface ThemeCardProps {
  theme: Theme
  isActive: boolean
  onSelect: (themeId: string) => void
}
