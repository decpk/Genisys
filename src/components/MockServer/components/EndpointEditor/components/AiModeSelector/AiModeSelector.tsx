import { RadioGroup } from 'radix-ui'

import { cn } from '@/lib/utils'

import { useAiModeSelectorData } from './useAiModeSelectorData'
import type { AiModeSelectorProps, AiResponseMode } from './AiModeSelector.types'
import { aiModeSelectorStyles as styles } from './AiModeSelector.styles'

export function AiModeSelector(props: AiModeSelectorProps) {
  const { mode, setMode, options, activeDescription } = useAiModeSelectorData(props)

  return (
    <div className={styles.root}>
      <span className={styles.label}>Response Mode</span>
      <RadioGroup.Root
        value={mode}
        onValueChange={(v) => setMode(v as AiResponseMode)}
        className={styles.group}
      >
        {options.map((opt) => {
          const active = opt.value === mode
          const cls = cn(styles.itemBase, active ? styles.itemActive : styles.itemInactive)
          return (
            <RadioGroup.Item key={opt.value} value={opt.value} className={cls}>
              {opt.label}
            </RadioGroup.Item>
          )
        })}
      </RadioGroup.Root>
      <p className={styles.description}>{activeDescription}</p>
    </div>
  )
}
