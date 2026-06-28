export interface WebpageUrlInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: () => void
  error?: string
  isLoading?: boolean
  autoFocus?: boolean
}
