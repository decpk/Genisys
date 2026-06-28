export interface FormSelectProps<T extends string> {
  label: string
  options: SelectOption<T>[]
  value: T
  onSelect: (value: T) => void
}

export interface SelectOption<T extends string = string> {
  value: T
  label: string
}
