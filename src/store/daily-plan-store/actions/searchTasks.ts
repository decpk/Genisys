type Set = (partial: any) => void

export async function searchTasksAction(set: Set, query: string): Promise<void> {
  if (!query.trim()) {
    set({ searchResults: [], searchQuery: query })
    return
  }

  try {
    const results = await (window as any).api.dpSearchTasks(query)
    set({ searchResults: results || [], searchQuery: query })
  } catch (err) {
    console.error('Failed to search tasks:', err)
  }
}
