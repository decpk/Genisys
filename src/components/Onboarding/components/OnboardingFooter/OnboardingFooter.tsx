import { ArrowRight, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface OnboardingFooterProps {
  onComplete: () => void
  disabled: boolean
}

export function OnboardingFooter(props: OnboardingFooterProps): React.JSX.Element {
  const { onComplete, disabled } = props

  const helperText = disabled
    ? 'Complete all steps above to continue'
    : 'You\u2019re all set!'

  const helperClass = disabled
    ? 'text-[11px] text-muted-foreground/40 text-center'
    : 'text-[11px] text-green-500/70 text-center flex items-center gap-1 justify-center'

  return (
    <div className="flex flex-col items-center gap-3 pt-12 pb-20">
      <Button
        onClick={onComplete}
        size="lg"
        className="px-12 gap-2 text-[15px] h-12 rounded-xl"
        disabled={disabled}
      >
        Get Started
        <ArrowRight size={16} />
      </Button>
      <p className={helperClass}>
        {!disabled && <CheckCircle2 size={12} />}
        {helperText}
      </p>
      <p className="text-[10px] text-muted-foreground/30 mt-1">
        You can revisit this from Settings → About
      </p>
    </div>
  )
}
