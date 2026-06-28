import { DEFAULT_STATUS_TEMPLATE } from '@/right-panels/DailyStatusPanel/constants/defaultTemplate'

export function getInitialContent(savedTemplate: string | null): string {
  return savedTemplate || DEFAULT_STATUS_TEMPLATE
}
