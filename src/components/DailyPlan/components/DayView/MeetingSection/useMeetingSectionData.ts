import { useState } from 'react'
import type { DPMeeting } from '../../../DailyPlan.types'
import { getMeetingsSubtitle } from '../shared/utils/getMeetingsSubtitle'
import {
  readSectionCollapsed,
  writeSectionCollapsed,
} from "../shared/utils/sectionCollapseStorage";

interface UseMeetingSectionDataArgs {
  meetings: DPMeeting[]
  defaultCollapsed: boolean
}

interface UseMeetingSectionDataReturn {
  isCollapsed: boolean
  toggleCollapsed: () => void
  subtitle: string
  countLabel: string
  editingMeeting: DPMeeting | null
  meetingDialogOpen: boolean
  handleEditMeeting: (meeting: DPMeeting) => void
  handleMeetingDialogClose: (open: boolean) => void
}

/**
 * Orchestrator hook for `MeetingSection`. Owns collapse state, derived
 * subtitle / count, and the edit dialog lifecycle. The view layer only
 * renders the returned values.
 */
export function useMeetingSectionData(
  args: UseMeetingSectionDataArgs
): UseMeetingSectionDataReturn {
  const { meetings, defaultCollapsed } = args

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() =>
    readSectionCollapsed("meetings", defaultCollapsed),
  );
  const [editingMeeting, setEditingMeeting] = useState<DPMeeting | null>(null)
  const [meetingDialogOpen, setMeetingDialogOpen] = useState<boolean>(false)

  const subtitle = getMeetingsSubtitle(meetings)
  const countLabel = String(meetings.length)

  function toggleCollapsed() {
    setIsCollapsed((prev) => {
      const next = !prev;
      writeSectionCollapsed("meetings", next);
      return next;
    });
  }

  function handleEditMeeting(meeting: DPMeeting) {
    setEditingMeeting(meeting)
    setMeetingDialogOpen(true)
  }

  function handleMeetingDialogClose(open: boolean) {
    setMeetingDialogOpen(open)
    if (!open) setEditingMeeting(null)
  }

  return {
    isCollapsed,
    toggleCollapsed,
    subtitle,
    countLabel,
    editingMeeting,
    meetingDialogOpen,
    handleEditMeeting,
    handleMeetingDialogClose,
  }
}
