import { Circle, CheckCircle2, AlertCircle } from 'lucide-react'
import { AppLoaderGlyph } from '@/components/AppLoader'

export const STATUS_INDICATOR = {
  pending: { icon: Circle, class: 'text-muted-foreground/20' },
  generating: { icon: AppLoaderGlyph, class: 'text-primary' },
  completed: { icon: CheckCircle2, class: 'text-success/25' },
  error: { icon: AlertCircle, class: 'text-destructive/50' },
} as const
