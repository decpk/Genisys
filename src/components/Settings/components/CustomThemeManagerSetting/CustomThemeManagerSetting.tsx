import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { CustomThemeManagerSettingProps } from './CustomThemeManagerSetting.types'
import { CustomThemeListItem } from './components/CustomThemeListItem'

export function CustomThemeManagerSetting(
  props: CustomThemeManagerSettingProps,
): React.JSX.Element {
  const { customThemes, activeThemeId, onCreate, onEdit, onDuplicate, onDelete, onApply } = props

  let listOrEmpty: React.ReactNode
  if (customThemes.length === 0) {
    listOrEmpty = (
      <div className="text-xs text-muted-foreground/80 italic px-1 py-3">
        No custom themes yet. Click <span className="text-foreground font-medium">+ New custom theme</span> to create one starting from your active theme.
      </div>
    )
  } else {
    const items = customThemes.map((theme) => (
      <CustomThemeListItem
        key={theme.id}
        theme={theme}
        isActive={theme.id === activeThemeId}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onApply={onApply}
      />
    ))
    listOrEmpty = <ul className="flex flex-col gap-1.5">{items}</ul>
  }

  return (
    <div className="py-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0 flex-1 max-w-md">
          <p className="text-sm font-medium text-foreground select-none">Custom themes</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed select-none">
            Manage your saved custom themes. Custom themes are stored as JSON files in your data
            directory and appear in the theme switcher alongside built-ins.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onCreate} className="gap-1.5 shrink-0">
          <Plus size={14} />
          New custom theme
        </Button>
      </div>
      {listOrEmpty}
    </div>
  )
}
