import { useCallback } from 'react'

import type {
  AiModeOption,
  AiModeSelectorProps,
  AiResponseMode,
} from './AiModeSelector.types'

const OPTIONS: AiModeOption[] = [
  {
    value: 'live',
    label: 'Live',
    description: 'Generate fresh on every request',
  },
  {
    value: 'cached',
    label: 'Cached',
    description: 'Generate once, reuse for a TTL window',
  },
  {
    value: 'pool',
    label: 'Pool',
    description: 'Pre-generate N samples, rotate per request',
  },
]

const DESCRIPTION_BY_MODE: Record<AiResponseMode, string> = {
  live: 'Generate fresh on every request',
  cached: 'Generate once, reuse for a TTL window',
  pool: 'Pre-generate N samples, rotate per request',
}

export function useAiModeSelectorData(props: AiModeSelectorProps) {
  const { mode: rawMode, onModeChange } = props
  const mode: AiResponseMode = rawMode ?? 'live'

  const setMode = useCallback(
    (next: AiResponseMode) => {
      onModeChange(next)
    },
    [onModeChange]
  )

  const activeDescription = DESCRIPTION_BY_MODE[mode]

  return {
    mode,
    setMode,
    options: OPTIONS,
    activeDescription,
  }
}
