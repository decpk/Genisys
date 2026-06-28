import React from 'react'
import { Check } from 'lucide-react'

/**
 * SaveStatusIndicator
 *
 * Modern pill-style indicator showing whether the current note is "Saving…" or
 * "Saved". Uses a soft tinted background, a status glyph (animated spinner ring
 * while saving / checkmark when saved) and smooth color transitions.
 *
 * Extracted into its own module so it can be reused by both the editor and the
 * bottom auto-scroll toolbar without creating a circular import.
 */
export function SaveStatusIndicator(props: {
  status: 'saving' | 'saved'
  compact?: boolean
}): React.JSX.Element {
  const { status, compact = false } = props
  const isSaving = status === 'saving'

  return (
    <div
      aria-live="polite"
      aria-atomic
      className={[
        'inline-flex items-center gap-1.5 rounded-full border pl-1 pr-2.5 py-1',
        'text-[11px] font-medium leading-none select-none',
        'transition-all duration-300 ease-out',
        isSaving
          ? 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
          : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      ].join(' ')}
    >
      {/* Status glyph */}
      <span className="relative flex size-4 items-center justify-center">
        {isSaving ? (
          <span className="size-3.5 rounded-full border-[1.5px] border-current border-t-transparent animate-spin" />
        ) : (
          <span className="flex size-4 items-center justify-center rounded-full bg-emerald-500/15">
            <Check size={11} strokeWidth={3} className="text-emerald-600 dark:text-emerald-400" />
          </span>
        )}
      </span>

      {!compact && (
        <span className="tracking-tight">{isSaving ? 'Saving' : 'Saved'}</span>
      )}
    </div>
  )
}
