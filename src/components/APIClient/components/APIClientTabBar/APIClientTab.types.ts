import type { ApiRequestItem } from '../../APIClient.types'

export interface APIClientTabProps {
  request: ApiRequestItem
  isActive: boolean
  isDirty: boolean
  isSending: boolean
  isDragging: boolean
  onActivate: (id: string) => void
  onClose: (id: string) => void
  onCloseOthers: (id: string) => void
  onCloseAll: () => void
}
