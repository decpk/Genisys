import { RadioGroup } from 'radix-ui'

import { cn } from '@/lib/utils'
import type { VariantMode } from '@/components/MockServer/MockServer.types'

import type {
  VariantModeOption,
  VariantModeSelectorProps,
} from './VariantModeSelector.types'
import { variantModeSelectorStyles as styles } from './VariantModeSelector.styles'

const OPTIONS: VariantModeOption[] = [
  { value: 'single', label: 'Single' },
  { value: 'sequence', label: 'Sequence' },
  { value: 'conditional', label: 'Conditional' },
  { value: 'random', label: 'Random' },
]

export function VariantModeSelector(props: VariantModeSelectorProps) {
  const { mode, onChange } = props
  return (
    <RadioGroup.Root
      value={mode}
      onValueChange={(v) => onChange(v as VariantMode)}
      className={styles.root}
    >
      {OPTIONS.map((opt) => {
        const active = opt.value === mode
        const cls = cn(styles.itemBase, active ? styles.itemActive : styles.itemInactive)
        return (
          <RadioGroup.Item key={opt.value} value={opt.value} className={cls}>
            {opt.label}
          </RadioGroup.Item>
        )
      })}
    </RadioGroup.Root>
  )
}
