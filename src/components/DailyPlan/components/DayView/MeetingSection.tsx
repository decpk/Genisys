import { CalendarClock } from 'lucide-react'
import { MeetingCard } from './MeetingSection/MeetingCard'
import { MeetingDialog } from '../MeetingDialog/MeetingDialog'
import { useMeetingSectionData } from './MeetingSection/useMeetingSectionData'
import type { MeetingSectionProps } from './MeetingSection/MeetingSection.types'
import { SectionShell } from './shared/SectionShell'
import { SectionHeader } from './shared/SectionHeader'
import { SectionActionsMenu } from './shared/SectionActionsMenu'
import { moveMeetingToDate } from '../../utils/moveMeetingToDate'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { DPMeeting } from '../../DailyPlan.types'
import { meetingSectionStyles as s } from './MeetingSection.styles'

export function MeetingSection(props: MeetingSectionProps): React.JSX.Element {
  const { meetings, defaultCollapsed, allComplete } = props
  const data = useMeetingSectionData({
    meetings,
    defaultCollapsed: defaultCollapsed ?? false,
  })
  const saveMeeting = useDailyPlanStore((s) => s.saveMeeting)

  const emptyState = (
    <div className={s.emptyContainer}>
      <CalendarClock className={s.emptyIcon} />
      <p className={s.emptyText}>No meetings scheduled</p>
    </div>
  )

  let body: React.ReactNode = null
  if (!data.isCollapsed) {
    body = (
      <div className={s.cardList}>
        {meetings.length === 0 && emptyState}
        {meetings.map((meeting) => (
          <MeetingCard
            key={meeting.id}
            meeting={meeting}
            onEdit={data.handleEditMeeting}
          />
        ))}
      </div>
    )
  }

  const menu = (
    <>
      <SectionActionsMenu<DPMeeting>
        items={meetings}
        itemNoun="meeting"
        sectionTitle="Meetings"
        moveItem={moveMeetingToDate}
        saveItem={saveMeeting}
        getIsCompleted={(m) => m.status === 'completed'}
      />
    </>
  )

  return (
    <SectionShell variant="meetings">
      <SectionHeader
        variant="meetings"
        title="Meetings"
        subtitle={data.subtitle}
        countLabel={data.countLabel}
        collapsed={data.isCollapsed}
        allComplete={allComplete}
        onToggle={data.toggleCollapsed}
        menuSlot={menu}
      />
      {body}
      <MeetingDialog
        open={data.meetingDialogOpen}
        onOpenChange={data.handleMeetingDialogClose}
        editMeeting={data.editingMeeting}
      />
    </SectionShell>
  )
}
