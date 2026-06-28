export type SmartCollectionKey =
  | 'url'
  | 'code'
  | 'color'
  | 'email'
  | 'json'
  | 'shell'
  | 'filepath'
  | 'phone'

export interface SmartCollectionConfig {
  key: SmartCollectionKey
  label: string
  icon: string
}

export interface SmartCollectionCount {
  key: SmartCollectionKey
  count: number
}
