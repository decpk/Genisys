import type { Theme } from '@/themes/themes.types'

export interface CustomThemeManagerSettingProps {
  customThemes: ReadonlyArray<Theme>
  activeThemeId: string
  /** Called when user clicks the "+ New custom theme" button. */
  onCreate: () => void
  /** Called when user clicks Edit on an item. */
  onEdit: (theme: Theme) => void
  /** Called when user clicks Duplicate on an item. */
  onDuplicate: (theme: Theme) => void
  /** Called when user confirms deletion. Must perform the deletion side effect. */
  onDelete: (theme: Theme) => void
  /** Called when user clicks Apply on an item (sets it as the active theme). */
  onApply: (theme: Theme) => void
}

export interface CustomThemeListItemProps {
  theme: Theme
  isActive: boolean
  onEdit: (theme: Theme) => void
  onDuplicate: (theme: Theme) => void
  onDelete: (theme: Theme) => void
  onApply: (theme: Theme) => void
}
