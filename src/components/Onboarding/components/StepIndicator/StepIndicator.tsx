interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function StepIndicator(props: StepIndicatorProps): React.JSX.Element {
  const { currentStep, totalSteps } = props

  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => {
        const isActive = i === currentStep
        const isPast = i < currentStep

        let dotClass = 'rounded-full transition-all duration-500 ease-out'

        if (isActive) {
          dotClass += ' w-7 h-2 bg-primary'
        } else if (isPast) {
          dotClass += ' w-2 h-2 bg-primary/40'
        } else {
          dotClass += ' w-2 h-2 bg-muted-foreground/15'
        }

        return <div key={i} className={dotClass} />
      })}
    </div>
  )
}
