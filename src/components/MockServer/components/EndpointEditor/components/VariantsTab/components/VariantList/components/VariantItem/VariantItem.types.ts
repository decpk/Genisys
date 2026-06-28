import type {
  MockEndpointVariant,
  VariantMode,
} from '@/components/MockServer/MockServer.types'

import type { UpdateVariantInput } from '../../../../VariantsTab.types'

export interface VariantItemProps {
  variant: MockEndpointVariant
  mode: VariantMode
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (params: UpdateVariantInput) => void
}
