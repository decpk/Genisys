'use client'

import * as React from 'react'
import { ChevronUp, ChevronDown, Clock } from 'lucide-react'

import { cn } from '@/lib/utils'

type TimePickerProps = {
  value?: Date
  onChange?: (date: Date) => void
  className?: string
  disabled?: boolean
  variant?: 'default' | 'compact'
}

type Period = 'AM' | 'PM'

function getHours12(date: Date): number {
  const h = date.getHours() % 12
  return h === 0 ? 12 : h
}

function getPeriod(date: Date): Period {
  return date.getHours() >= 12 ? 'PM' : 'AM'
}

function setHours24(date: Date, hours12: number, period: Period): Date {
  const next = new Date(date)
  let h = hours12 % 12
  if (period === 'PM') h += 12
  next.setHours(h)
  return next
}

function setMinutes(date: Date, minutes: number): Date {
  const next = new Date(date)
  next.setMinutes(minutes)
  return next
}

function clampAndWrap(value: number, min: number, max: number): number {
  if (value > max) return min
  if (value < min) return max
  return value
}

function TimeSegment(props: {
  value: string
  onIncrement: () => void
  onDecrement: () => void
  onChange: (value: string) => void
  max: number
  min: number
  label: string
  disabled?: boolean
  variant?: 'default' | 'compact'
}) {
  const { value, onIncrement, onDecrement, onChange, max, min, label, disabled, variant = 'default' } = props
  const isCompact = variant === 'compact'

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      onIncrement()
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      onDecrement()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (raw.length <= 2) {
      onChange(raw)
    }
  }

  const handleBlur = () => {
    const num = parseInt(value, 10)
    if (isNaN(num) || num < min) {
      onChange(String(min).padStart(2, '0'))
      return
    }
    if (num > max) {
      onChange(String(max).padStart(2, '0'))
      return
    }
    onChange(String(num).padStart(2, '0'))
  }

  if (isCompact) {
    return (
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={disabled}
        aria-label={label}
        className={cn(
          'w-7 h-7 text-center text-xs font-medium rounded-md bg-transparent',
          'text-foreground placeholder:text-muted-foreground',
          'focus-visible:outline-none',
          'transition-[color,box-shadow]',
          'disabled:opacity-50 disabled:pointer-events-none'
        )}
      />
    )
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        onClick={onIncrement}
        className="flex items-center justify-center size-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:pointer-events-none"
        aria-label={`Increase ${label}`}
      >
        <ChevronUp className="size-3.5" />
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={disabled}
        aria-label={label}
        className={cn(
          'w-10 h-9 text-center text-sm font-medium rounded-md border border-input bg-transparent',
          'text-foreground placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/30',
          'transition-[color,box-shadow]',
          'disabled:opacity-50 disabled:pointer-events-none'
        )}
      />
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        onClick={onDecrement}
        className="flex items-center justify-center size-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:pointer-events-none"
        aria-label={`Decrease ${label}`}
      >
        <ChevronDown className="size-3.5" />
      </button>
    </div>
  )
}

function PeriodToggle(props: {
  value: Period
  onChange: (period: Period) => void
  disabled?: boolean
  variant?: 'default' | 'compact'
}) {
  const { value, onChange, disabled, variant = 'default' } = props
  const isCompact = variant === 'compact'

  const handleClick = () => {
    onChange(value === 'AM' ? 'PM' : 'AM')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      onChange(value === 'AM' ? 'PM' : 'AM')
    }
  }

  if (isCompact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label="Toggle AM/PM"
        className={cn(
          'w-8 h-7 text-center text-xs font-medium rounded-md',
          'text-muted-foreground',
          'hover:text-foreground hover:bg-accent transition-colors',
          'focus-visible:outline-none',
          'disabled:opacity-50 disabled:pointer-events-none'
        )}
      >
        {value}
      </button>
    )
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="size-6" />
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label="Toggle AM/PM"
        className={cn(
          'w-12 h-9 text-center text-sm font-medium rounded-md border border-input',
          'bg-accent/50 text-foreground',
          'hover:bg-accent transition-colors',
          'focus-visible:outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/30',
          'disabled:opacity-50 disabled:pointer-events-none'
        )}
      >
        {value}
      </button>
      <div className="size-6" />
    </div>
  )
}

function TimePicker(props: TimePickerProps) {
  const { value, onChange, className, disabled, variant = 'default' } = props
  const isCompact = variant === 'compact'
  const date = value ?? new Date()

  const hours = getHours12(date)
  const minutes = date.getMinutes()
  const period = getPeriod(date)

  const [hoursStr, setHoursStr] = React.useState(String(hours).padStart(2, '0'))
  const [minutesStr, setMinutesStr] = React.useState(String(minutes).padStart(2, '0'))

  React.useEffect(() => {
    setHoursStr(String(getHours12(date)).padStart(2, '0'))
    setMinutesStr(String(date.getMinutes()).padStart(2, '0'))
  }, [date.getHours(), date.getMinutes()])

  const emitChange = (next: Date) => {
    onChange?.(next)
  }

  const handleHoursChange = (raw: string) => {
    setHoursStr(raw)
    const num = parseInt(raw, 10)
    if (!isNaN(num) && num >= 1 && num <= 12) {
      emitChange(setHours24(date, num, period))
    }
  }

  const handleMinutesChange = (raw: string) => {
    setMinutesStr(raw)
    const num = parseInt(raw, 10)
    if (!isNaN(num) && num >= 0 && num <= 59) {
      emitChange(setMinutes(date, num))
    }
  }

  const incrementHours = () => {
    const next = clampAndWrap(hours + 1, 1, 12)
    emitChange(setHours24(date, next, period))
  }

  const decrementHours = () => {
    const next = clampAndWrap(hours - 1, 1, 12)
    emitChange(setHours24(date, next, period))
  }

  const incrementMinutes = () => {
    const next = clampAndWrap(minutes + 1, 0, 59)
    emitChange(setMinutes(date, next))
  }

  const decrementMinutes = () => {
    const next = clampAndWrap(minutes - 1, 0, 59)
    emitChange(setMinutes(date, next))
  }

  const handlePeriodChange = (p: Period) => {
    emitChange(setHours24(date, hours, p))
  }

  if (isCompact) {
    return (
      <div
        className={cn(
          'flex items-center gap-1 px-2 h-8 rounded-md border border-transparent bg-transparent',
          'transition-[color,box-shadow]',
          'focus-within:border-input focus-within:ring-1 focus-within:ring-ring/20',
          className
        )}
      >
        <Clock className="size-3.5 text-muted-foreground" />
        <TimeSegment
          value={hoursStr}
          onIncrement={incrementHours}
          onDecrement={decrementHours}
          onChange={handleHoursChange}
          min={1}
          max={12}
          label="Hours"
          disabled={disabled}
          variant="compact"
        />
        <span className="text-xs font-medium text-muted-foreground">:</span>
        <TimeSegment
          value={minutesStr}
          onIncrement={incrementMinutes}
          onDecrement={decrementMinutes}
          onChange={handleMinutesChange}
          min={0}
          max={59}
          label="Minutes"
          disabled={disabled}
          variant="compact"
        />
        <PeriodToggle
          value={period}
          onChange={handlePeriodChange}
          disabled={disabled}
          variant="compact"
        />
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Clock className="size-4 text-muted-foreground mr-1" />
      <TimeSegment
        value={hoursStr}
        onIncrement={incrementHours}
        onDecrement={decrementHours}
        onChange={handleHoursChange}
        min={1}
        max={12}
        label="Hours"
        disabled={disabled}
      />
      <span className="text-sm font-medium text-muted-foreground self-center mt-px">:</span>
      <TimeSegment
        value={minutesStr}
        onIncrement={incrementMinutes}
        onDecrement={decrementMinutes}
        onChange={handleMinutesChange}
        min={0}
        max={59}
        label="Minutes"
        disabled={disabled}
      />
      <PeriodToggle
        value={period}
        onChange={handlePeriodChange}
        disabled={disabled}
      />
    </div>
  )
}

export { TimePicker }
export type { TimePickerProps }
