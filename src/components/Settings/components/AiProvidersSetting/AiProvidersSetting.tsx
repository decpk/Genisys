import { memo, useState } from 'react'
import { Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { SettingRow } from '../SettingRow'

import {
  useAiProvidersSettingData,
  type AiProviderId,
  type AiProviderState,
} from './useAiProvidersSettingData'

const META: Record<AiProviderId, { name: string; placeholder: string; description: string }> = {
  openai: {
    name: 'OpenAI',
    placeholder: 'sk-…',
    description: 'API key for GPT models (api.openai.com).',
  },
  anthropic: {
    name: 'Anthropic',
    placeholder: 'sk-ant-…',
    description: 'API key for Claude models (api.anthropic.com).',
  },
  google: {
    name: 'Google',
    placeholder: 'AIza…',
    description: 'API key for Gemini models (Generative Language API).',
  },
  custom: {
    name: 'Custom (OpenAI-compatible)',
    placeholder: 'API key',
    description: 'Any OpenAI-compatible endpoint — Ollama, OpenRouter, LM Studio, …',
  },
}

interface RowProps {
  id: AiProviderId
  state: AiProviderState
  busy: boolean
  onSave: (apiKey: string, baseUrl?: string, models?: string[]) => void
  onClear: () => void
}

function StandardProviderRow({ id, state, busy, onSave, onClear }: RowProps): React.JSX.Element {
  const [key, setKey] = useState('')
  const meta = META[id]
  return (
    <SettingRow label={meta.name} description={meta.description}>
      <div className="flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-2">
          <Input
            type="password"
            autoComplete="off"
            placeholder={state.configured ? '•••••••• (saved)' : meta.placeholder}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-60 h-8 text-xs"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            disabled={busy || key.trim().length === 0}
            onClick={() => {
              onSave(key.trim())
              setKey('')
            }}
          >
            Save
          </Button>
          {state.configured && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-destructive"
              disabled={busy}
              onClick={onClear}
            >
              Remove
            </Button>
          )}
        </div>
        {state.configured && (
          <span className="flex items-center gap-1 text-[10px] text-emerald-500">
            <Check size={11} /> Configured
          </span>
        )}
      </div>
    </SettingRow>
  )
}

function CustomProviderRow({ state, busy, onSave, onClear }: RowProps): React.JSX.Element {
  const [key, setKey] = useState('')
  const [baseUrl, setBaseUrl] = useState(state.baseUrl ?? '')
  const [models, setModels] = useState((state.models ?? []).join(', '))
  const meta = META.custom
  return (
    <SettingRow label={meta.name} description={meta.description}>
      <div className="flex flex-col items-end gap-1.5">
        <Input
          type="text"
          autoComplete="off"
          placeholder="Base URL — e.g. http://localhost:11434/v1"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          className="w-72 h-8 text-xs"
        />
        <Input
          type="text"
          autoComplete="off"
          placeholder="Model ids (comma-separated) — e.g. llama3, qwen2.5"
          value={models}
          onChange={(e) => setModels(e.target.value)}
          className="w-72 h-8 text-xs"
        />
        <div className="flex items-center gap-2">
          <Input
            type="password"
            autoComplete="off"
            placeholder={state.configured ? '•••••••• (saved)' : meta.placeholder}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-48 h-8 text-xs"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            disabled={busy || baseUrl.trim().length === 0}
            onClick={() => {
              const modelList = models
                .split(',')
                .map((m) => m.trim())
                .filter(Boolean)
              onSave(key.trim(), baseUrl.trim(), modelList)
              setKey('')
            }}
          >
            Save
          </Button>
          {state.configured && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-destructive"
              disabled={busy}
              onClick={onClear}
            >
              Remove
            </Button>
          )}
        </div>
        {state.configured && (
          <span className="flex items-center gap-1 text-[10px] text-emerald-500">
            <Check size={11} /> Configured
          </span>
        )}
      </div>
    </SettingRow>
  )
}

/**
 * BYOK "AI Providers" setting — lets the user supply their own API keys for
 * OpenAI / Anthropic / Google or a custom OpenAI-compatible endpoint. Keys are
 * stored locally (never leave the device except to the provider you configure).
 */
export const AiProvidersSetting = memo(function AiProvidersSetting(): React.JSX.Element {
  const { providers, busy, error, saveKey, clearKey } = useAiProvidersSettingData()
  return (
    <>
      <StandardProviderRow
        id="openai"
        state={providers.openai}
        busy={busy === 'openai'}
        onSave={(k) => void saveKey('openai', k)}
        onClear={() => void clearKey('openai')}
      />
      <StandardProviderRow
        id="anthropic"
        state={providers.anthropic}
        busy={busy === 'anthropic'}
        onSave={(k) => void saveKey('anthropic', k)}
        onClear={() => void clearKey('anthropic')}
      />
      <StandardProviderRow
        id="google"
        state={providers.google}
        busy={busy === 'google'}
        onSave={(k) => void saveKey('google', k)}
        onClear={() => void clearKey('google')}
      />
      <CustomProviderRow
        id="custom"
        state={providers.custom}
        busy={busy === 'custom'}
        onSave={(k, baseUrl, models) => void saveKey('custom', k, baseUrl, models)}
        onClear={() => void clearKey('custom')}
      />
      {error && <p className="text-[10px] text-destructive">{error}</p>}
    </>
  )
})
