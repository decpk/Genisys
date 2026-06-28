import type {
  MockEndpointVariant,
  VariantMode,
} from '@/components/MockServer/MockServer.types'

import type { UpdateVariantInput } from '../../VariantsTab.types'

export interface VariantListProps {
  mode: VariantMode
  variants: MockEndpointVariant[]
  onAdd: () => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (params: UpdateVariantInput) => void
}
