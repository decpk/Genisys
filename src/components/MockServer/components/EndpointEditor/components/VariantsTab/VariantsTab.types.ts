import type {
  MockEndpointVariant,
  VariantMode,
} from '@/components/MockServer/MockServer.types'

export interface UpdateVariantInput {
  id: string
  name?: string
  statusCode?: number
  responseHeaders?: string
  responseBody?: string
  matchRules?: string
  weight?: number
  orderIndex?: number
  isActive?: boolean
}

export interface UseVariantsTabData {
  mode: VariantMode
  variants: MockEndpointVariant[]
  endpointId: string | null
  setMode: (mode: VariantMode) => void
  handleAddVariant: () => void
  handleDuplicateVariant: (id: string) => void
  handleDeleteVariant: (id: string) => void
  handleUpdateVariant: (params: UpdateVariantInput) => void
}
