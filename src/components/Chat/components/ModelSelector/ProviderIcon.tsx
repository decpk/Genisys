import { SiOpenai, SiAnthropic, SiGooglegemini } from 'react-icons/si'

import type { ModelProvider } from './ModelSelector.types'

const ICON_MAP: Record<
  ModelProvider,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  openai: SiOpenai,
  anthropic: SiAnthropic,
  google: SiGooglegemini
}

export function ProviderIcon({
  provider,
  size = 14,
  className = ''
}: {
  provider: ModelProvider
  size?: number
  className?: string
}): React.JSX.Element {
  const Icon = ICON_MAP[provider]
  return <Icon size={size} className={className} />
}
