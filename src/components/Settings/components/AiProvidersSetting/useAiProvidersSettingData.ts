import { useCallback, useEffect, useState } from 'react'

import { useSettingsStore } from '@/store/settings-store'

export type AiProviderId = 'openai' | 'anthropic' | 'google' | 'custom'

export interface AiProviderState {
  configured: boolean
  baseUrl?: string | null
  models?: string[]
}

export type AiProvidersState = Record<AiProviderId, AiProviderState>

const EMPTY: AiProvidersState = {
  openai: { configured: false },
  anthropic: { configured: false },
  google: { configured: false },
  custom: { configured: false },
}

export interface UseAiProvidersSettingDataReturn {
  providers: AiProvidersState
  busy: AiProviderId | null
  error: string | null
  saveKey: (
    provider: AiProviderId,
    apiKey: string,
    baseUrl?: string,
    models?: string[],
  ) => Promise<void>
  clearKey: (provider: AiProviderId) => Promise<void>
}

/**
 * Orchestrator for the BYOK "AI Providers" setting. Loads the configured-state
 * of each provider, and persists / clears keys, re-deriving the available model
 * list after every change.
 */
export function useAiProvidersSettingData(): UseAiProvidersSettingDataReturn {
  const [providers, setProviders] = useState<AiProvidersState>(EMPTY)
  const [busy, setBusy] = useState<AiProviderId | null>(null)
  const [error, setError] = useState<string | null>(null)
  const reconcileModels = useSettingsStore((s) => s.reconcileModels)

  const refresh = useCallback(async () => {
    try {
      const p = await window.api.getAiProviders()
      if (!p) return
      setProviders({
        openai: p.openai ?? { configured: false },
        anthropic: p.anthropic ?? { configured: false },
        google: p.google ?? { configured: false },
        custom: p.custom ?? { configured: false },
      })
    } catch {
      // ignore — leave previous state
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const saveKey = useCallback(
    async (
      provider: AiProviderId,
      apiKey: string,
      baseUrl?: string,
      models?: string[],
    ) => {
      setBusy(provider)
      setError(null)
      try {
        const res = await window.api.setAiProviderKey(provider, apiKey, baseUrl, models)
        if (!res?.success) {
          setError(res?.error ?? 'Failed to save key.')
          return
        }
        await refresh()
        reconcileModels()
      } finally {
        setBusy(null)
      }
    },
    [refresh, reconcileModels],
  )

  const clearKey = useCallback(
    async (provider: AiProviderId) => {
      setBusy(provider)
      setError(null)
      try {
        await window.api.clearAiProviderKey(provider)
        await refresh()
        reconcileModels()
      } finally {
        setBusy(null)
      }
    },
    [refresh, reconcileModels],
  )

  return { providers, busy, error, saveKey, clearKey }
}
