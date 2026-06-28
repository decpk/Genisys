import type { AiResponseMode } from '../AiModeSelector'

export interface AiCacheSettingsProps {
  mode: AiResponseMode
  cacheTtlMs: number
  onCacheTtlChange: (ms: number) => void
  poolSize: number
  onPoolSizeChange: (size: number) => void
}
