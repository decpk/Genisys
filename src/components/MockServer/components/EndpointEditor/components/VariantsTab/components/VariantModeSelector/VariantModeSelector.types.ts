import type { VariantMode } from '@/components/MockServer/MockServer.types'

export interface VariantModeSelectorProps {
  mode: VariantMode
  onChange: (mode: VariantMode) => void
}

export interface VariantModeOption {
  value: VariantMode
  label: string
}
