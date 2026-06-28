import { PROVIDER_MAX_TOOLS } from '../../AiPanelToolsSetting.constants'

export function getProviderMaxTools(modelId: string): number {
  for (const [prefix, limit] of Object.entries(PROVIDER_MAX_TOOLS)) {
    if (modelId.startsWith(prefix)) return limit
  }
  return 128
}
