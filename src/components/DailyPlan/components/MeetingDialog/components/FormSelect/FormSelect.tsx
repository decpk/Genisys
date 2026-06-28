import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { formSelectStyles as styles } from './FormSelect.styles'
import type { FormSelectProps } from './FormSelect.types'

export function FormSelect<T extends string>(props: FormSelectProps<T>): React.JSX.Element {
  const { label, options, value, onSelect } = props
  const currentLabel = options.find((o) => o.value === value)?.label ?? value

  const items = options.map((opt) => {
    const isSelected = value === opt.value
    const itemClass = `${styles.item} ${isSelected ? styles.itemActive : styles.itemInactive}`

    return (
      <DropdownMenuItem
        key={opt.value}
        onSelect={() => onSelect(opt.value)}
        className={itemClass}
      >
        {opt.label}
      </DropdownMenuItem>
    )
  })

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>{label}</label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={styles.trigger}>
            <span>{currentLabel}</span>
            <ChevronDown size={14} />
          </button>
        </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={4}
            className={styles.content}
          >
            {items}
          </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
