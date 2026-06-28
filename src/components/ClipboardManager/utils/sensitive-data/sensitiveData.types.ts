export type SensitivityLevel = 'none' | 'low' | 'medium' | 'high' | 'critical'

export type SensitiveDataType =
  | 'api_key'
  | 'private_key'
  | 'jwt_token'
  | 'password'
  | 'credit_card'
  | 'ssn'
  | 'connection_string'
  | 'aws_credential'
  | 'env_secret'

export interface SensitiveMatch {
  type: SensitiveDataType
  label: string
  level: SensitivityLevel
  start: number
  end: number
}

export interface SensitivityResult {
  level: SensitivityLevel
  matches: SensitiveMatch[]
}
