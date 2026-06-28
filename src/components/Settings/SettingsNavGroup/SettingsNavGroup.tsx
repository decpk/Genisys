import { cn } from '@/lib/utils'

import { groupHeaderClass, navButtonBase } from './SettingsNavGroup.styles'
import { getNavButtonClass } from './utils/getNavButtonClass'
import type { SettingsNavGroupProps } from './SettingsNavGroup.types'

export function SettingsNavGroup(props: SettingsNavGroupProps): React.JSX.Element {
  const { group, activeSection, onSectionChange } = props

  return (
    <div className="[&:first-child>p]:pt-2">
      <p className={groupHeaderClass}>{group.label}</p>
      {group.items.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onSectionChange(key)}
          className={cn(navButtonBase, getNavButtonClass(key, activeSection))}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}
    </div>
  )
}
