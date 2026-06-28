import type { DPMeetingFormData } from '../../../../DailyPlan.types'

export type EditorSectionKey = 'agenda' | 'notes' | 'outcome' | 'followUp'

export interface EditorSectionConfig {
  key: EditorSectionKey
  label: string
  placeholder: string
}

export interface MeetingEditorSectionsProps {
  formData: Pick<
    DPMeetingFormData,
    'agenda' | 'notes' | 'outcome' | 'followUp'
  >
  onFieldChange: (field: EditorSectionKey, value: string) => void
}

export const EDITOR_SECTIONS: EditorSectionConfig[] = [
  { key: 'agenda', label: 'Agenda', placeholder: 'Topics to discuss...' },
  { key: 'notes', label: 'Notes', placeholder: 'Meeting notes...' },
  {
    key: 'outcome',
    label: 'Outcome',
    placeholder: 'Decisions made, results...',
  },
  {
    key: 'followUp',
    label: 'Follow-Up',
    placeholder: 'Action items, next steps...',
  },
]
