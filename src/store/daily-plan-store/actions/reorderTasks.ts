type Get = () => any
type Set = (partial: any) => void

export async function reorderTasksAction(
  get: Get, set: Set, date: string, orderedIds: string[]
): Promise<void> {
  try {
    await (window as any).api.dpReorderTasks(orderedIds)

    const state = get()
    const tasks = { ...state.tasks }

    if (tasks[date]) {
      const taskMap = new Map(tasks[date].map((t: any) => [t.id, t]))
      tasks[date] = orderedIds
        .filter((id) => taskMap.has(id))
        .map((id, index) => ({ ...taskMap.get(id)!, sortOrder: index }))
    }

    set({ tasks })
  } catch (err) {
    console.error('Failed to reorder tasks:', err)
  }
}
