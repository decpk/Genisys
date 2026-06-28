import { cn } from '@/lib/utils'

import type { ThemeTabButtonProps } from './ThemeTabButton.types'
import { THEME_TAB_BUTTON_STYLES } from './ThemeTabButton.styles'

export function ThemeTabButton(props: ThemeTabButtonProps): React.JSX.Element {
  const { active, onClick, children } = props

  const stateClass = active
    ? THEME_TAB_BUTTON_STYLES.active
    : THEME_TAB_BUTTON_STYLES.inactive

  return (
    <button onClick={onClick} className={cn(THEME_TAB_BUTTON_STYLES.base, stateClass)}>
      {children}
    </button>
  )
}
