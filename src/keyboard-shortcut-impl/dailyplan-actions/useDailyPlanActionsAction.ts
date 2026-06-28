import { useBindShortcutActions } from '@/frameworks/keyboard-shortcut'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { getToday, addDays } from '@/components/DailyPlan/utils/formatDate'

function newTask(): void {
  useDailyPlanStore.getState().setTaskDialogOpen(true)
}

function newMeeting(): void {
  useDailyPlanStore.getState().setMeetingDialogOpen(true)
}

function goToToday(): void {
  const today = getToday()
  const store = useDailyPlanStore.getState()
  store.setSelectedDate(today)
  store.loadDataForDate(today)
}

function prevDay(): void {
  const store = useDailyPlanStore.getState()
  const newDate = addDays(store.selectedDate, -1)
  store.setSelectedDate(newDate)
  store.loadDataForDate(newDate)
}

function nextDay(): void {
  const store = useDailyPlanStore.getState()
  const newDate = addDays(store.selectedDate, 1)
  store.setSelectedDate(newDate)
  store.loadDataForDate(newDate)
}

function viewDay(): void {
  useDailyPlanStore.getState().setViewMode('day')
}

function viewWeek(): void {
  useDailyPlanStore.getState().setViewMode('week')
}

function viewMonth(): void {
  useDailyPlanStore.getState().setViewMode('month')
}

export function useDailyPlanActionsAction(): void {
  useBindShortcutActions({
    'dailyplan.newTask': newTask,
    'dailyplan.newMeeting': newMeeting,
    'dailyplan.goToToday': goToToday,
    'dailyplan.prevDay': prevDay,
    'dailyplan.nextDay': nextDay,
    'dailyplan.viewDay': viewDay,
    'dailyplan.viewWeek': viewWeek,
    'dailyplan.viewMonth': viewMonth,
  })
}
