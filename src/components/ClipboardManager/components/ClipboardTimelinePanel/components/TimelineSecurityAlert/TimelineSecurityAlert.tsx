import { memo } from 'react'
import { ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SensitivityLevel } from '../../../../utils/sensitive-data'
import type { TimelineSecurityAlertProps } from './TimelineSecurityAlert.types'
import {
  SECURITY_ALERT_ROOT, SECURITY_ALERT_ICON,
  SECURITY_ALERT_TEXT, SECURITY_ALERT_COUNT,
} from './TimelineSecurityAlert.styles'

const LEVEL_STYLES: Record<Exclude<SensitivityLevel, 'none'>, string> = {
  low: 'bg-blue-400/10 text-blue-400 border border-blue-400/20',
  medium: 'bg-amber-400/10 text-amber-400 border border-amber-400/20',
  high: 'bg-orange-400/10 text-orange-400 border border-orange-400/20',
  critical: 'bg-red-400/10 text-red-400 border border-red-400/20',
}

const TYPE_LABELS: Record<string, string> = {
  api_key: 'API Key',
  private_key: 'Private Key',
  jwt_token: 'JWT Token',
  password: 'Password',
  credit_card: 'Credit Card',
  ssn: 'SSN',
  connection_string: 'Connection String',
  aws_credential: 'AWS Credential',
  env_secret: 'Env Secret',
}

export const TimelineSecurityAlert = memo(function TimelineSecurityAlert(props: TimelineSecurityAlertProps): React.JSX.Element {
  const { alert } = props

  const levelStyle = LEVEL_STYLES[alert.level as Exclude<SensitivityLevel, 'none'>] ?? LEVEL_STYLES.low
  const typeLabel = alert.matchTypes.length > 0
    ? TYPE_LABELS[alert.matchTypes[0]] ?? alert.matchTypes[0]
    : 'Sensitive data'
  const countLabel = alert.matchCount > 1 ? `${alert.matchCount} matches` : '1 match'

  return (
    <div className={cn(SECURITY_ALERT_ROOT, levelStyle)}>
      <ShieldAlert className={SECURITY_ALERT_ICON} />
      <span className={SECURITY_ALERT_TEXT}>{typeLabel} detected</span>
      <span className={SECURITY_ALERT_COUNT}>{countLabel}</span>
    </div>
  )
})
