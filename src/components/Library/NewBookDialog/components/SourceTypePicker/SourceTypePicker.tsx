import { BookText, Globe } from 'lucide-react'

import { cn } from '@/lib/utils'

import * as styles from './SourceTypePicker.styles'
import type { SourceType, SourceTypeOption, SourceTypePickerProps } from './SourceTypePicker.types'

const OPTIONS: SourceTypeOption[] = [
  { value: 'topic', label: 'Topic', description: 'Type a title or subject' },
  { value: 'webpage', label: 'Webpage URL', description: 'Build from any web page' },
]

const ICONS: Record<SourceType, typeof BookText> = {
  topic: BookText,
  webpage: Globe,
}

export function SourceTypePicker(props: SourceTypePickerProps): React.JSX.Element {
  const { value, onChange } = props

  return (
    <div className={styles.WRAPPER}>
      {OPTIONS.map((option) => {
        const isSelected = value === option.value
        const Icon = ICONS[option.value]
        const cardStateClass = isSelected ? styles.CARD_SELECTED : styles.CARD_UNSELECTED
        const iconStateClass = isSelected ? styles.ICON_WRAPPER_SELECTED : styles.ICON_WRAPPER_UNSELECTED
        const cardClass = cn(styles.CARD_BASE, cardStateClass)
        const iconWrapperClass = cn(styles.ICON_WRAPPER_BASE, iconStateClass)

        return (
          <button key={option.value} type="button" onClick={() => onChange(option.value)} className={cardClass}>
            <div className={iconWrapperClass}>
              <Icon size={16} />
            </div>
            <div className={styles.CONTENT}>
              <span className={styles.LABEL}>{option.label}</span>
              <span className={styles.DESCRIPTION}>{option.description}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
