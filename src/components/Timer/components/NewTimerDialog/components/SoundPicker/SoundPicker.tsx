import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { TIMER_SOUNDS } from '../../../../constants/timerSounds'
import { getSoundById } from '../../../../utils/getSoundById'

import type { SoundPickerProps } from './SoundPicker.types'

export function SoundPicker(props: SoundPickerProps): React.JSX.Element {
  const { value, onChange } = props
  const current = getSoundById(value)
  const label = current?.label ?? 'Select sound'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="justify-between min-w-[12rem]">
          <span>{label}</span>
          <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {TIMER_SOUNDS.map((s) => (
          <DropdownMenuItem key={s.id} onSelect={() => onChange(s.id)}>
            {s.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
