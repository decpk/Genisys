import { useState, useCallback, useRef } from 'react'

import { useSettingsStore } from '@/store/settings-store'

import type { McpSyncResult, McpSyncState } from './Onboarding.types'

const TOTAL_STEPS = 4

interface UseOnboardingDataReturn {
  mounted: boolean
  setMounted: (value: boolean) => void
  currentStep: number
  totalSteps: number
  exiting: boolean
  entering: boolean
  direction: 'forward' | 'back'
  goNext: () => void
  goBack: () => void
  syncState: McpSyncState
  syncResult: McpSyncResult | null
  syncError: string | null
  handleSyncMcp: () => Promise<void>
  handleSkipMcp: () => void
  handleComplete: () => void
}

export function useOnboardingData(): UseOnboardingDataReturn {
  const setHasCompletedOnboarding = useSettingsStore((s) => s.setHasCompletedOnboarding)

  const [mounted, setMounted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [exiting, setExiting] = useState(false)
  const [entering, setEntering] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const stepRef = useRef(0)
  const exitingRef = useRef(false)

  const [syncState, setSyncState] = useState<McpSyncState>('idle')
  const [syncResult, setSyncResult] = useState<McpSyncResult | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  const goNext = useCallback(() => {
    if (stepRef.current >= TOTAL_STEPS - 1 || exitingRef.current) return
    exitingRef.current = true
    setDirection('forward')
    setExiting(true)
    const nextStep = stepRef.current + 1
    setTimeout(() => {
      stepRef.current = nextStep
      setCurrentStep(nextStep)
      setExiting(false)
      setEntering(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEntering(false)
          exitingRef.current = false
        })
      })
    }, 300)
  }, [])

  const goBack = useCallback(() => {
    if (stepRef.current <= 0 || exitingRef.current) return
    exitingRef.current = true
    setDirection('back')
    setExiting(true)
    const prevStep = stepRef.current - 1
    setTimeout(() => {
      stepRef.current = prevStep
      setCurrentStep(prevStep)
      setExiting(false)
      setEntering(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEntering(false)
          exitingRef.current = false
        })
      })
    }, 300)
  }, [])

  const handleSyncMcp = useCallback(async () => {
    setSyncState('syncing')
    setSyncError(null)
    try {
      const result = await window.api.mcpSyncVscode()
      setSyncResult(result)
      setSyncState('done')
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Failed to sync MCP servers')
      setSyncState('error')
    }
  }, [])

  const handleSkipMcp = useCallback(() => {
    setSyncState('skipped')
  }, [])

  const handleComplete = useCallback(() => {
    setHasCompletedOnboarding(true)
  }, [setHasCompletedOnboarding])

  return {
    mounted,
    setMounted,
    currentStep,
    totalSteps: TOTAL_STEPS,
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
  }
}
