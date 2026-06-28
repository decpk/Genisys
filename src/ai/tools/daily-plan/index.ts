import type { ToolModule } from "./tools.types";

// Read tools
import getTasksForDate from "./getTasksForDate";
import getTasksForRange from "./getTasksForRange";
import getMeetingsForDate from "./getMeetingsForDate";
import getMeetingsForRange from "./getMeetingsForRange";
import getDailyEntry from "./getDailyEntry";
import searchTasks from "./searchTasks";
import getTaskDetails from "./getTaskDetails";
import listCategories from "./listCategories";
import listTemplates from "./listTemplates";
import getCurrentContext from "./getCurrentContext";

// Write tools — Tasks
import createTask from "./createTask";
import updateTask from "./updateTask";
import deleteTask from "./deleteTask";
import toggleTaskComplete from "./toggleTaskComplete";
import rescheduleTask from "./rescheduleTask";
import setTaskPriority from "./setTaskPriority";
import setTaskCategory from "./setTaskCategory";

// Write tools — Meetings
import createMeeting from "./createMeeting";
import updateMeeting from "./updateMeeting";
import deleteMeeting from "./deleteMeeting";
import rescheduleMeeting from "./rescheduleMeeting";

// Write tools — Other
import saveDailyEntry from "./saveDailyEntry";
import createCategory from "./createCategory";
import updateCategory from "./updateCategory";
import deleteCategory from "./deleteCategory";
import createTemplate from "./createTemplate";
import applyTemplate from "./applyTemplate";
import deleteTemplate from "./deleteTemplate";

// Navigation
import setSelectedDate from "./setSelectedDate";
import setViewMode from "./setViewMode";
import setDayViewMode from "./setDayViewMode";

const ALL_TOOLS: ToolModule[] = [
  getTasksForDate,
  getTasksForRange,
  getMeetingsForDate,
  getMeetingsForRange,
  getDailyEntry,
  searchTasks,
  getTaskDetails,
  listCategories,
  listTemplates,
  getCurrentContext,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskComplete,
  rescheduleTask,
  setTaskPriority,
  setTaskCategory,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  rescheduleMeeting,
  saveDailyEntry,
  createCategory,
  updateCategory,
  deleteCategory,
  createTemplate,
  applyTemplate,
  deleteTemplate,
  setSelectedDate,
  setViewMode,
  setDayViewMode,
];

import { MEMORY_TOOL_DEFINITIONS, MEMORY_TOOL_REGISTRY } from '@/ai/tools/memory';

/** Tool definitions array — sent to the AI provider */
export const DAILYPLAN_TOOL_DEFINITIONS = [
  ...ALL_TOOLS.map((t) => t.definition),
  ...MEMORY_TOOL_DEFINITIONS,
];

/** Tool registry map — for dispatching tool calls by name */
export const DAILYPLAN_TOOL_REGISTRY: Record<string, ToolModule> = {
  ...Object.fromEntries(ALL_TOOLS.map((t) => [t.name, t])),
  ...MEMORY_TOOL_REGISTRY,
};

/**
 * Names of tools considered safe in read-only AI assistant modes
 * (`plan` and `ask`). Filtered out of the tool list and refused at
 * dispatch time when the panel is not in `agent` mode.
 */
export const DAILYPLAN_READ_TOOL_NAMES: ReadonlySet<string> = new Set<string>([
  'get_tasks_for_date',
  'get_tasks_for_range',
  'get_meetings_for_date',
  'get_meetings_for_range',
  'get_daily_entry',
  'search_tasks',
  'get_task_details',
  'list_categories',
  'list_templates',
  'get_current_context',
  'memory_view',
]);
