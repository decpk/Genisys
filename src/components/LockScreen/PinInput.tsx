import { memo, useRef, useCallback, type KeyboardEvent, type ClipboardEvent } from 'react'
import { cn } from '@/lib/utils'

interface PinInputProps {
  length: number
  value: string
  onChange: (value: string) => void
  onComplete: (value: string) => void
  disabled?: boolean
  error?: boolean
}

export const PinInput = memo(function PinInput({
  length,
  value,
  onChange,
  onComplete,
  disabled,
  error,
}: PinInputProps): React.JSX.Element {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const focusInput = useCallback((index: number) => {
    inputRefs.current[index]?.focus()
  }, [])

  const handleChange = useCallback(
    (index: number, digit: string) => {
      if (!/^\d?$/.test(digit)) return

      const chars = value.split('')
      while (chars.length < length) chars.push('')
      chars[index] = digit
      const next = chars.join('')
      onChange(next)

      if (digit && index < length - 1) {
        focusInput(index + 1)
      }

      const filled = chars.filter(Boolean).length
      if (filled === length && digit) {
        onComplete(next)
      }
    },
    [value, length, onChange, onComplete, focusInput]
  )

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault()
        const chars = value.split('')
        if (chars[index]) {
          chars[index] = ''
          onChange(chars.join(''))
        } else if (index > 0) {
          chars[index - 1] = ''
          onChange(chars.join(''))
          focusInput(index - 1)
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        focusInput(index - 1)
      } else if (e.key === 'ArrowRight' && index < length - 1) {
        focusInput(index + 1)
      }
    },
    [value, length, onChange, focusInput]
  )

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
      if (!pasted) return
      onChange(pasted)
      if (pasted.length === length) {
        onComplete(pasted)
      } else {
        focusInput(Math.min(pasted.length, length - 1))
      }
    },
    [length, onChange, onComplete, focusInput]
  )

  return (
    <div className="flex items-center justify-center gap-2.5">
      {Array.from({ length }, (_, i) => {
        const char = value[i] || ''
        return (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el }}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={char}
            disabled={disabled}
            autoComplete="off"
            className={cn(
              'w-11 h-13 text-center text-lg font-semibold rounded-lg border bg-transparent transition-all duration-150 outline-none',
              'focus-visible:border-input focus-visible:ring-ring/20 focus-visible:ring-1',
              error
                ? 'border-destructive ring-destructive/20'
                : 'border-transparent',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
          />
        )
      })}
    </div>
  )
})
