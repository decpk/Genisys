import { create } from 'zustand'

import type {
  DPTask, DPReview, DPMeeting, DPDailyEntry, DPDailyStatus, DPCategory, DPTemplate,
  DPViewMode, DPDayViewMode, DPTaskSortBy, DPSortDirection
} from '@/components/DailyPlan/DailyPlan.types'

import { loadDataForDateAction } from './daily-plan-store/actions/loadDataForDate'
import { loadDataForRangeAction } from './daily-plan-store/actions/loadDataForRange'
import { saveTaskAction } from './daily-plan-store/actions/saveTask'
import { removeTaskAction } from './daily-plan-store/actions/removeTask'
import { toggleTaskCompleteAction } from './daily-plan-store/actions/toggleTaskComplete'
import { saveReviewAction } from './daily-plan-store/actions/saveReview'
import { addReviewTodoAction, type AddReviewTodoInput } from './daily-plan-store/actions/addReviewTodo'
import { removeReviewAction } from './daily-plan-store/actions/removeReview'
import { toggleReviewCompleteAction } from './daily-plan-store/actions/toggleReviewComplete'
import { reorderTasksAction } from './daily-plan-store/actions/reorderTasks'
import { saveMeetingAction } from './daily-plan-store/actions/saveMeeting'
import { removeMeetingAction } from './daily-plan-store/actions/removeMeeting'
import { saveDailyEntryAction } from './daily-plan-store/actions/saveDailyEntry'
import { saveDailyStatusAction } from './daily-plan-store/actions/saveDailyStatus'
import { loadCategoriesAction } from './daily-plan-store/actions/loadCategories'
import { saveCategoryAction } from './daily-plan-store/actions/saveCategory'
import { removeCategoryAction } from './daily-plan-store/actions/removeCategory'
import { loadTemplatesAction } from './daily-plan-store/actions/loadTemplates'
import { saveTemplateAction } from './daily-plan-store/actions/saveTemplate'
import { removeTemplateAction } from './daily-plan-store/actions/removeTemplate'
import { applyTemplateAction } from './daily-plan-store/actions/applyTemplate'
import { searchTasksAction } from './daily-plan-store/actions/searchTasks'
import { searchMeetingsAction } from './daily-plan-store/actions/searchMeetings'

interface DailyPlanState {
  selectedDate: string
  viewMode: DPViewMode
  dayViewMode: DPDayViewMode
  tasks: Record<string, DPTask[]>
  reviews: Record<string, DPReview[]>
  meetings: Record<string, DPMeeting[]>
  dailyEntries: Record<string, DPDailyEntry>
  dailyStatus: Record<string, DPDailyStatus>
  categories: DPCategory[]
  templates: DPTemplate[]
  searchQuery: string
  searchResults: DPTask[]
  searchMeetingResults: DPMeeting[]
  isSearching: boolean
  isLoading: boolean
  isInitialized: boolean
  taskDialogOpen: boolean
  meetingDialogOpen: boolean
  reviewDialogOpen: boolean
  taskSortBy: DPTaskSortBy
  taskSortDir: DPSortDirection
}

interface DailyPlanActions {
  setSelectedDate: (date: string) => void
  setViewMode: (mode: DPViewMode) => void
  setDayViewMode: (mode: DPDayViewMode) => void
  loadDataForDate: (date: string) => Promise<void>
  loadDataForRange: (startDate: string, endDate: string) => Promise<void>
  saveTask: (task: DPTask) => Promise<void>
  removeTask: (id: string, date: string) => Promise<void>
  toggleTaskComplete: (task: DPTask) => Promise<void>
  saveReview: (review: DPReview) => Promise<void>
  addReviewTodo: (input: AddReviewTodoInput) => Promise<void>
  removeReview: (id: string, date: string) => Promise<void>
  toggleReviewComplete: (review: DPReview) => Promise<void>
  reorderTasks: (date: string, orderedIds: string[]) => Promise<void>
  saveMeeting: (meeting: DPMeeting) => Promise<void>
  removeMeeting: (id: string, date: string) => Promise<void>
  saveDailyEntry: (entry: DPDailyEntry) => Promise<void>
  saveDailyStatus: (date: string, content: string) => Promise<void>
  loadCategories: () => Promise<void>
  saveCategory: (category: DPCategory) => Promise<void>
  removeCategory: (id: string) => Promise<void>
  loadTemplates: () => Promise<void>
  saveTemplate: (template: DPTemplate) => Promise<void>
  removeTemplate: (id: string) => Promise<void>
  applyTemplate: (templateId: string, date: string) => Promise<{ tasksCreated: number; meetingsCreated: number }>
  searchTasks: (query: string) => Promise<void>
  searchMeetings: (query: string) => Promise<void>
  setSearchQuery: (query: string) => void
  setIsSearching: (value: boolean) => void
  setTaskDialogOpen: (open: boolean) => void
  setMeetingDialogOpen: (open: boolean) => void
  setReviewDialogOpen: (open: boolean) => void
  setTaskSortBy: (sortBy: DPTaskSortBy) => void
  setTaskSortDir: (direction: DPSortDirection) => void
}

// Helper to get today's date as YYYY-MM-DD
function getTodayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// --- Sort preference persistence (no persist middleware on this store) ---
const SORT_STORAGE_KEY = 'genisys.dailyPlan.taskSort'
const VALID_SORT_BY: DPTaskSortBy[] = ['manual', 'priority', 'time', 'created', 'title', 'status']
const VALID_SORT_DIR: DPSortDirection[] = ['asc', 'desc']

function loadSortPref(): { taskSortBy: DPTaskSortBy; taskSortDir: DPSortDirection } {
  const fallback = { taskSortBy: 'manual' as DPTaskSortBy, taskSortDir: 'asc' as DPSortDirection }
  try {
    const raw = localStorage.getItem(SORT_STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as { taskSortBy?: unknown; taskSortDir?: unknown }
    const taskSortBy = VALID_SORT_BY.includes(parsed.taskSortBy as DPTaskSortBy)
      ? (parsed.taskSortBy as DPTaskSortBy)
      : fallback.taskSortBy
    const taskSortDir = VALID_SORT_DIR.includes(parsed.taskSortDir as DPSortDirection)
      ? (parsed.taskSortDir as DPSortDirection)
      : fallback.taskSortDir
    return { taskSortBy, taskSortDir }
  } catch {
    return fallback
  }
}

function saveSortPref(taskSortBy: DPTaskSortBy, taskSortDir: DPSortDirection): void {
  try {
    localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify({ taskSortBy, taskSortDir }))
  } catch {
    // Ignore storage failures (e.g. private mode / quota); sorting still works in-session.
  }
}

const initialSortPref = loadSortPref()

export const useDailyPlanStore = create<DailyPlanState & DailyPlanActions>()((set, get) => ({
  // State
  selectedDate: getTodayStr(),
  viewMode: 'day',
  dayViewMode: 'sections',
  tasks: {},
  reviews: {},
  meetings: {},
  dailyEntries: {},
  dailyStatus: {},
  categories: [],
  templates: [],
  searchQuery: '',
  searchResults: [],
  searchMeetingResults: [],
  isSearching: false,
  isLoading: false,
  isInitialized: false,
  taskDialogOpen: false,
  meetingDialogOpen: false,
  reviewDialogOpen: false,
  taskSortBy: initialSortPref.taskSortBy,
  taskSortDir: initialSortPref.taskSortDir,

  // Actions
  setSelectedDate: (date) => set({ selectedDate: date }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setDayViewMode: (mode) => set({ dayViewMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  loadDataForDate: (date) => loadDataForDateAction(get, set, date),
  loadDataForRange: (start, end) => loadDataForRangeAction(get, set, start, end),
  saveTask: (task) => saveTaskAction(get, set, task),
  removeTask: (id, date) => removeTaskAction(get, set, id, date),
  toggleTaskComplete: (task) => toggleTaskCompleteAction(get, set, task),
  saveReview: (review) => saveReviewAction(get, set, review),
  addReviewTodo: (input) => addReviewTodoAction(get, input),
  removeReview: (id, date) => removeReviewAction(get, set, id, date),
  toggleReviewComplete: (review) => toggleReviewCompleteAction(get, set, review),
  reorderTasks: (date, ids) => reorderTasksAction(get, set, date, ids),
  saveMeeting: (meeting) => saveMeetingAction(get, set, meeting),
  removeMeeting: (id, date) => removeMeetingAction(get, set, id, date),
  saveDailyEntry: (entry) => saveDailyEntryAction(get, set, entry),
  saveDailyStatus: (date, content) => saveDailyStatusAction(get, set, date, content),
  loadCategories: () => loadCategoriesAction(set),
  saveCategory: (cat) => saveCategoryAction(get, set, cat),
  removeCategory: (id) => removeCategoryAction(get, set, id),
  loadTemplates: () => loadTemplatesAction(set),
  saveTemplate: (tmpl) => saveTemplateAction(get, set, tmpl),
  removeTemplate: (id) => removeTemplateAction(get, set, id),
  applyTemplate: (templateId, date) => applyTemplateAction(get, set, templateId, date),
  searchTasks: (query) => searchTasksAction(set, query),
  searchMeetings: (query) => searchMeetingsAction(set, query),
  setIsSearching: (value) => set({ isSearching: value }),
  setTaskDialogOpen: (open) => set({ taskDialogOpen: open }),
  setMeetingDialogOpen: (open) => set({ meetingDialogOpen: open }),
  setReviewDialogOpen: (open) => set({ reviewDialogOpen: open }),
  setTaskSortBy: (sortBy) => {
    set({ taskSortBy: sortBy })
    saveSortPref(sortBy, get().taskSortDir)
  },
  setTaskSortDir: (direction) => {
    set({ taskSortDir: direction })
    saveSortPref(get().taskSortBy, direction)
  },
}))
