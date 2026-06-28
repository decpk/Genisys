export interface DailyStatusPanelData {
  selectedDate: string
  localContent: string
  copied: boolean
  dateLabel: string
}

export interface DailyStatusPanelActions {
  handleChange: (markdown: string) => void
  handleCopy: () => void
}
