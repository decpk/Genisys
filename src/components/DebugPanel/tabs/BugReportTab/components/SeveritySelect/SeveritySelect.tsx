import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { SEVERITY_OPTIONS } from '../../BugReportTab.constants'
import { getSeverityLabel } from '../../utils/getSeverityLabel'
import { contentClass, triggerClass } from './SeveritySelect.styles'
import type { SeveritySelectProps } from './SeveritySelect.types'

export function SeveritySelect(props: SeveritySelectProps) {
  const { value, onChange } = props
  const currentLabel = getSeverityLabel(value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={triggerClass}>
          {currentLabel}
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={contentClass}>
        {SEVERITY_OPTIONS.map((option) => (
          <DropdownMenuItem key={option.value} onSelect={() => onChange(option.value)}>
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
