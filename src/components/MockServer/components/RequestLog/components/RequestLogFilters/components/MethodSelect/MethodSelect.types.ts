export const HTTP_METHODS = [
  'ALL',
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
] as const

export type HttpMethodOption = (typeof HTTP_METHODS)[number]

export interface MethodSelectProps {
  value: HttpMethodOption
  onValueChange: (value: HttpMethodOption) => void
  disabled?: boolean
}
