import { useEffect } from 'react'
import { ArrowRight, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { StepWelcome } from './components/StepWelcome'
import { StepTheme } from './components/StepTheme'
import { StepMcp } from './components/StepMcp'
import { StepReady } from './components/StepReady'
import { StepIndicator } from './components/StepIndicator'
import { useOnboardingData } from './useOnboardingData'
import { ONBOARDING_STYLES } from './Onboarding.styles'

export function Onboarding(): React.JSX.Element {
  const {
    mounted,
    setMounted,
    currentStep,
    totalSteps,
    exiting,
    entering,
    direction,
    goNext,
    goBack,
    syncState,
    syncResult,
    syncError,
    handleSyncMcp,
    handleSkipMcp,
    handleComplete,
  } = useOnboardingData()

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [setMounted])

  let stepContent: React.ReactNode = null

  if (currentStep === 0) {
    stepContent = <StepWelcome />
  }

  if (currentStep === 1) {
    stepContent = <StepTheme />
  }

  if (currentStep === 2) {
    stepContent = (
      <StepMcp
        syncState={syncState}
        syncResult={syncResult}
        syncError={syncError}
        onSync={handleSyncMcp}
        onSkip={handleSkipMcp}
      />
    )
  }

  if (currentStep === 3) {
    stepContent = <StepReady />
  }

  // Slide transition: exit slides out, entering starts offset then animates to center
  let translateX = '0'
  let opacity = 1
  let transitionEnabled = true

  if (exiting) {
    translateX = direction === 'forward' ? '-100px' : '100px'
    opacity = 0
  } else if (entering) {
    // Instant jump to offset (no transition), will animate to 0 next frame
    translateX = direction === 'forward' ? '100px' : '-100px'
    opacity = 0
    transitionEnabled = false
  }

  const stepTransition: React.CSSProperties = {
    opacity,
    transform: `translateX(${translateX})`,
    transition: transitionEnabled ? 'opacity 0.3s ease-out, transform 0.3s ease-out' : 'none',
    pointerEvents: exiting || entering ? 'none' : 'auto',
  }

  // Determine nav button state
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === 3

  // Continue button disabled logic per step.
  // Auth steps must be completed before proceeding.
  // MCP step is gated until the scan reaches a terminal state (done / error / skipped).
  let continueDisabled = false
  if (currentStep === 2) {
    continueDisabled = syncState === 'idle' || syncState === 'syncing'
  }

  const handleNavAction = () => {
    if (isLastStep) {
      handleComplete()
    } else {
      goNext()
    }
  }

  const navLabel = isFirstStep ? "Let's Go" : isLastStep ? 'Get Started' : 'Continue'

  return (
    <div className={ONBOARDING_STYLES.overlay}>
      <div
        className={ONBOARDING_STYLES.container}
        style={mounted ? ONBOARDING_STYLES.fadeIn : ONBOARDING_STYLES.fadeOut}
      >
        <div className={ONBOARDING_STYLES.stepArea} style={stepTransition}>
          <div className="my-auto w-full flex justify-center">
            {stepContent}
          </div>
        </div>

        {/* Fixed navigation bar */}
        <div className={ONBOARDING_STYLES.navBar}>
          {!isFirstStep && (
            <Button
              onClick={goBack}
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground/40 hover:text-foreground"
            >
              <ArrowLeft size={14} />
              Back
            </Button>
          )}
          <Button
            onClick={handleNavAction}
            size="lg"
            className="px-10 gap-2 text-base h-12 rounded-xl"
            disabled={continueDisabled}
          >
            {navLabel}
            <ArrowRight size={18} />
          </Button>
        </div>

        <div className={ONBOARDING_STYLES.indicatorArea}>
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
        </div>
      </div>
    </div>
  )
}
