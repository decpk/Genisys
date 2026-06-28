type Set = (partial: any) => void

export async function searchMeetingsAction(set: Set, query: string): Promise<void> {
  if (!query.trim()) {
    set({ searchMeetingResults: [], searchQuery: query })
    return
  }

  try {
    const results = await (window as any).api.dpSearchMeetings(query)
    set({ searchMeetingResults: results || [], searchQuery: query })
  } catch (err) {
    console.error('Failed to search meetings:', err)
  }
}
