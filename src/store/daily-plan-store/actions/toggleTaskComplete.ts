type Get = () => any
type Set = (partial: any) => void

export async function toggleTaskCompleteAction(get: Get, set: Set, task: any): Promise<void> {
  const updatedTask = { ...task }

  if (task.status === 'completed') {
    updatedTask.status = 'todo'
    updatedTask.completedAt = null
  } else {
    updatedTask.status = 'completed'
    updatedTask.completedAt = new Date().toISOString()
  }

  try {
    await (window as any).api.dpSaveTask(updatedTask)

    const state = get()
    const tasks = { ...state.tasks }
    const date = updatedTask.scheduledDate

    if (tasks[date]) {
      const idx = tasks[date].findIndex((t: any) => t.id === updatedTask.id)
      if (idx >= 0) {
        tasks[date] = [...tasks[date]]
        tasks[date][idx] = updatedTask
      }
    }

    set({ tasks })
  } catch (err) {
    console.error('Failed to toggle task complete:', err)
  }
}
