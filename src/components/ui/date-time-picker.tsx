'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { TimePicker } from '@/components/ui/time-picker'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type DateTimePickerProps = {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  dateFormat?: string
}

function DateTimePicker(props: DateTimePickerProps) {
  const {
    value,
    onChange,
    placeholder = 'Pick date & time',
    className,
    disabled,
    dateFormat = 'PPP p',
  } = props

  const [open, setOpen] = React.useState(false)

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange?.(undefined)
      return
    }

    const next = new Date(date)
    if (value) {
      next.setHours(value.getHours())
      next.setMinutes(value.getMinutes())
      next.setSeconds(value.getSeconds())
    }
    onChange?.(next)
  }

  const handleTimeChange = (date: Date) => {
    onChange?.(date)
  }

  const displayText = value ? format(value, dateFormat) : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-[280px] justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="size-4 opacity-60" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
          autoFocus
        />
        <div className="border-t border-border p-3">
          <TimePicker
            value={value ?? new Date()}
            onChange={handleTimeChange}
            disabled={disabled}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DateTimePicker }
export type { DateTimePickerProps }
