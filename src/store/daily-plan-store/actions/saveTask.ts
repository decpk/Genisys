type Get = () => any
type Set = (partial: any) => void

export async function saveTaskAction(get: Get, set: Set, task: any): Promise<void> {
  try {
    await (window as any).api.dpSaveTask(task)

    const state = get()
    const tasks = { ...state.tasks }
    const date = task.scheduledDate

    // Remove task from any other date it might have been on (task moved)
    for (const key of Object.keys(tasks)) {
      if (key !== date && tasks[key]) {
        const idx = tasks[key].findIndex((t: any) => t.id === task.id)
        if (idx >= 0) {
          tasks[key] = tasks[key].filter((t: any) => t.id !== task.id)
        }
      }
    }

    // Add or update in the target date
    if (!tasks[date]) tasks[date] = []
    const existingIdx = tasks[date].findIndex((t: any) => t.id === task.id)
    if (existingIdx >= 0) {
      tasks[date] = tasks[date].map((t: any, i: number) => (i === existingIdx ? task : t))
    } else {
      tasks[date] = [...tasks[date], task]
    }

    set({ tasks })
  } catch (err) {
    console.error('Failed to save task:', err)
  }
}
