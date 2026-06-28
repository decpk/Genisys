import { useEffect, useState } from 'react'

import type { AppShowcaseItem } from '../../Onboarding.types'

interface AppShowcaseCardProps {
  item: AppShowcaseItem
  index: number
}

export function AppShowcaseCard(props: AppShowcaseCardProps): React.JSX.Element {
  const { item, index } = props
  const Icon = item.icon
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60 + index * 40)
    return () => clearTimeout(t)
  }, [index])

  return (
    <div
      className="group flex items-center gap-4 rounded-xl border border-border/30 bg-card/40 px-5 py-4 hover:bg-card/70 hover:border-border/50 transition-all duration-200"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.98)',
        transition: 'opacity 0.35s ease-out, transform 0.35s ease-out, background-color 0.15s, border-color 0.15s',
      }}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary/70 group-hover:text-primary group-hover:bg-primary/20 transition-colors duration-200">
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground leading-tight">{item.label}</p>
        <p className="text-xs text-muted-foreground/50 leading-tight mt-0.5">{item.description}</p>
      </div>
    </div>
  )
}
