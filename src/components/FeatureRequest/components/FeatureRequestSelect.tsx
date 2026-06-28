import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import type { FeatureRequestOption } from '../FeatureRequest.types'

interface FeatureRequestSelectProps<T extends string> {
  value: T
  options: ReadonlyArray<FeatureRequestOption<T>>
  onChange: (value: T) => void
  ariaLabel?: string
}

export function FeatureRequestSelect<T extends string>(props: FeatureRequestSelectProps<T>) {
  const { value, options, onChange, ariaLabel } = props
  const currentLabel = options.find((option) => option.value === value)?.label ?? ''

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={ariaLabel}
          className="w-full justify-between"
        >
          {currentLabel}
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[var(--radix-dropdown-menu-trigger-width)]">
        {options.map((option) => (
          <DropdownMenuItem key={option.value} onSelect={() => onChange(option.value)}>
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
