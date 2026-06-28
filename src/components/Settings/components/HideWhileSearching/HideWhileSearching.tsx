import { useSettingsSearchContext } from '../../settings-search'

import type { HideWhileSearchingProps } from './HideWhileSearching.types'

/**
 * Hides custom (non-`SettingRow`) widgets while a settings search is active, so
 * the flat results show only matching rows instead of whole feature panels.
 * Outside search (or with no provider) it renders children untouched.
 */
export function HideWhileSearching(props: HideWhileSearchingProps): React.JSX.Element | null {
  const { children } = props
  const { isActive } = useSettingsSearchContext()

  if (isActive) return null

  return <>{children}</>
}
