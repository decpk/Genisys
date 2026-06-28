import { ChevronDown, ChevronUp } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { MinutesStepperProps } from './MinutesStepper.types'

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min
  if (value > max) return max
  return value
}

export function MinutesStepper(props: MinutesStepperProps): React.JSX.Element {
  const {
    value,
    onChange,
    min = 0,
    max = 9999,
    step = 5,
    suffix,
    className,
    ariaLabel,
  } = props

  const safeValue = Number.isFinite(value) ? value : min
  const setSafe = (next: number) => onChange(clamp(next, min, max))
  const handleInc = () => setSafe(safeValue + step)
  const handleDec = () => setSafe(safeValue - step)
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim()
    if (raw === '') {
      onChange(min)
      return
    }
    const parsed = Number(raw)
    if (!Number.isFinite(parsed)) return
    setSafe(parsed)
  }
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      handleInc()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      handleDec()
    }
  }

  const decDisabled = safeValue <= min
  const incDisabled = safeValue >= max

  return (
    <div
      className={cn(
        'inline-flex items-stretch h-8 rounded-md border border-input bg-background',
        'focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/30 transition-colors',
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={safeValue}
        onChange={handleInput}
        onKeyDown={handleKey}
        aria-label={ariaLabel}
        className="w-12 bg-transparent px-2 text-xs tabular-nums text-foreground outline-none text-right"
      />
      {suffix && (
        <span className="flex items-center pr-1 text-[10px] text-muted-foreground select-none">
          {suffix}
        </span>
      )}
      <div className="flex flex-col border-l border-border/60">
        <button
          type="button"
          tabIndex={-1}
          onClick={handleInc}
          disabled={incDisabled}
          aria-label="Increase"
          className="flex h-1/2 w-5 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground transition-colors rounded-tr-[5px]"
        >
          <ChevronUp size={11} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          tabIndex={-1}
          onClick={handleDec}
          disabled={decDisabled}
          aria-label="Decrease"
          className="flex h-1/2 w-5 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground transition-colors border-t border-border/60 rounded-br-[5px]"
        >
          <ChevronDown size={11} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
