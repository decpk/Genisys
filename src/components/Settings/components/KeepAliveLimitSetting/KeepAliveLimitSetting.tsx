import { memo } from 'react'
import { Select } from 'radix-ui'
import { Check, ChevronDown } from 'lucide-react'

import { SettingRow } from '../SettingRow'
import { keepAliveLimitSettingStyles as s } from './KeepAliveLimitSetting.styles'
import { useKeepAliveLimitSettingData } from './useKeepAliveLimitSettingData'

export const KeepAliveLimitSetting = memo(function KeepAliveLimitSetting(): React.JSX.Element {
  const { value, options, onChange } = useKeepAliveLimitSettingData()

  const items = options.map((option) => (
    <Select.Item key={option.value} value={option.value} className={s.item}>
      <Select.ItemText>{option.label}</Select.ItemText>
      <Select.ItemIndicator className={s.itemIndicator}>
        <Check size={14} />
      </Select.ItemIndicator>
    </Select.Item>
  ))

  return (
    <SettingRow
      label="Apps kept in memory"
      description="Controls how many recently-used apps stay mounted in the background for instant switching. A higher number keeps more apps instantly switchable but uses more memory; a lower number stays snappier when many apps are open. 'Unlimited' keeps every opened app mounted (legacy behavior)."
    >
      <Select.Root value={value} onValueChange={onChange}>
        <Select.Trigger className={s.trigger} aria-label="Apps kept in memory">
          <Select.Value />
          <Select.Icon className="opacity-60">
            <ChevronDown size={14} />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content position="popper" sideOffset={4} className={s.content}>
            <Select.Viewport className={s.viewport}>{items}</Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </SettingRow>
  )
})
