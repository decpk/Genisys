type Get = () => any
type Set = (partial: any) => void

export async function removeTaskAction(get: Get, set: Set, id: string, date: string): Promise<void> {
  try {
    await (window as any).api.dpRemoveTask(id)

    const state = get()
    const tasks = { ...state.tasks }
    if (tasks[date]) {
      tasks[date] = tasks[date].filter((t: any) => t.id !== id)
    }

    set({ tasks })
  } catch (err) {
    console.error('Failed to remove task:', err)
  }
}
