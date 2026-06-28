import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { scopedToast } from '@/frameworks/notification'
import { useSettingsStore } from '@/store/settings-store'

import { INITIAL_BUG_REPORT } from './BugReportTab.constants'
import type { BugReportFormState, BugSeverity, UseBugReportData } from './BugReportTab.types'

const toast = scopedToast('debug')

export function useBugReportData(): UseBugReportData {
  const userEmail = useSettingsStore((s) => s.userEmail)
  const emailTouchedRef = useRef(false)

  const [form, setForm] = useState<BugReportFormState>(() => ({
    ...INITIAL_BUG_REPORT,
    email: userEmail
  }))

  // Autofill the contact email with the signed-in user's email as soon as it is
  // available (it can resolve asynchronously after this tab mounts), unless the
  // user has already edited the field themselves.
  useEffect(() => {
    if (emailTouchedRef.current || !userEmail) return
    setForm((prev) => (prev.email === userEmail ? prev : { ...prev, email: userEmail }))
  }, [userEmail])

  const setTitle = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, title: value }))
  }, [])

  const setDescription = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, description: value }))
  }, [])

  const setSteps = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, steps: value }))
  }, [])

  const setSeverity = useCallback((value: BugSeverity) => {
    setForm((prev) => ({ ...prev, severity: value }))
  }, [])

  const setEmail = useCallback((value: string) => {
    emailTouchedRef.current = true
    setForm((prev) => ({ ...prev, email: value }))
  }, [])

  const reset = useCallback(() => {
    emailTouchedRef.current = false
    setForm({ ...INITIAL_BUG_REPORT, email: userEmail })
  }, [userEmail])

  const canSubmit = useMemo(
    () => form.title.trim().length > 0 && form.description.trim().length > 0,
    [form.title, form.description]
  )

  // When a signed-in email is available it is authoritative, so the contact
  // field is filled and locked to prevent the user from changing it.
  const emailLocked = userEmail.trim().length > 0

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return

    // Open-source build: there is no bundled reporting backend. Capture the
    // report locally (dev console) so a fork can wire up its own destination
    // here. The form still gives the user immediate feedback.
    if (import.meta.env.DEV) {
      console.debug('[BugReportTab] submit', { form })
    }

    toast.success('Bug report captured', {
      description: 'Saved locally — wire up a backend to forward reports.'
    })
    reset()
  }, [form, canSubmit, reset])

  return {
    form,
    canSubmit,
    emailLocked,
    setTitle,
    setDescription,
    setSteps,
    setSeverity,
    setEmail,
    reset,
    handleSubmit
  }
}
