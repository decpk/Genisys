import { BarChart3 } from 'lucide-react'

import { errorStyles } from '../RechartsViewer.styles'
import type { ChartErrorProps } from './ChartError.types'

export function ChartError(props: ChartErrorProps): React.JSX.Element {
  const { error } = props

  return (
    <div className={errorStyles.container}>
      <div className={errorStyles.header}>
        <BarChart3 size={12} className="text-destructive/60" />
        <span className={errorStyles.label}>Chart — Error</span>
      </div>
      <div className={errorStyles.body}>
        <pre className={errorStyles.message}>{error}</pre>
      </div>
    </div>
  )
}
