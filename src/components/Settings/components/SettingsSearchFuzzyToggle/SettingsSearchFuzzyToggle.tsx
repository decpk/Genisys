import { Sparkles } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'

import { settingsSearchFuzzyToggleStyles as styles } from './SettingsSearchFuzzyToggle.styles'
import type { SettingsSearchFuzzyToggleProps } from './SettingsSearchFuzzyToggle.types'

/**
 * Icon button rendered inside the search box that toggles fuzzy matching.
 * Highlighted (colored background) when fuzzy is on; plain/muted when off.
 */
export function SettingsSearchFuzzyToggle(
  props: SettingsSearchFuzzyToggleProps,
): React.JSX.Element {
  const { fuzzyEnabled, onToggle } = props

  const stateClass = fuzzyEnabled ? styles.active : styles.inactive
  const tooltip = fuzzyEnabled ? 'Fuzzy matching on' : 'Fuzzy matching off'

  const handleClick = () => onToggle(!fuzzyEnabled)

  return (
    <IconButton
      size="xs"
      variant="ghost"
      tooltip={tooltip}
      aria-pressed={fuzzyEnabled}
      onClick={handleClick}
      className={stateClass}
    >
      <Sparkles size={12} />
    </IconButton>
  )
}
