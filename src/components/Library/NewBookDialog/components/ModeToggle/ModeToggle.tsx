import { FileText, FolderOpen, Sparkles } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { BookMode } from '../../NewBookDialog.types'

import type { ModeToggleProps } from './ModeToggle.types'

interface ModeOption {
  value: BookMode
  label: string
  Icon: typeof Sparkles
}

const MODES: ModeOption[] = [
  { value: 'ai', label: 'AI Generated', Icon: Sparkles },
  { value: 'raw-md', label: 'Raw Markdown', Icon: FileText },
  { value: 'local-md', label: 'Local Files', Icon: FolderOpen },
]

const BUTTON_BASE =
  'flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium transition-colors cursor-pointer'
const BUTTON_SELECTED = 'border-primary bg-primary/10 text-primary'
const BUTTON_UNSELECTED =
  'border-border hover:border-muted-foreground/50 text-muted-foreground hover:text-foreground'

export function ModeToggle(props: ModeToggleProps): React.JSX.Element {
  const { mode, onModeChange } = props

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {MODES.map((option) => {
        const isSelected = mode === option.value
        const stateClass = isSelected ? BUTTON_SELECTED : BUTTON_UNSELECTED
        const { Icon } = option

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onModeChange(option.value)}
            className={cn(BUTTON_BASE, stateClass)}
          >
            <Icon size={13} />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
