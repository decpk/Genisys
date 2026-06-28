import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

import {
  CARD_CONTENT_PADDING,
  CARD_DESCRIPTION,
  CARD_ICON_WRAPPER,
  CARD_TITLE,
  CARD_TRIGGER,
  CARD_TRIGGER_LEFT,
  CARD_TRIGGER_RIGHT,
  CARD_WRAPPER,
} from './SettingsCard.styles'
import type { SettingsCardProps } from './SettingsCard.types'

export function SettingsCard(props: SettingsCardProps): React.JSX.Element {
  const { id, icon: Icon, title, description, summary, children, contentClassName } = props

  let descriptionJsx: React.ReactNode = null
  if (description) {
    descriptionJsx = <p className={CARD_DESCRIPTION}>{description}</p>
  }

  let summaryJsx: React.ReactNode = null
  if (summary) {
    summaryJsx = <div className={CARD_TRIGGER_RIGHT}>{summary}</div>
  }

  return (
    <AccordionItem value={id} className={CARD_WRAPPER}>
      <AccordionTrigger className={CARD_TRIGGER}>
        <div className={CARD_TRIGGER_LEFT}>
          <div className={CARD_ICON_WRAPPER}>
            <Icon size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <p className={CARD_TITLE}>{title}</p>
            {descriptionJsx}
          </div>
        </div>
        {summaryJsx}
      </AccordionTrigger>
      <AccordionContent className={cn(CARD_CONTENT_PADDING, contentClassName)}>
        {children}
      </AccordionContent>
    </AccordionItem>
  )
}
