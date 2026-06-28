export async function searchNoteSuggestions(
  appId: string,
  query: string,
): Promise<{ id: string; title: string }[]> {
  return (await window.api.searchNoteSuggestions(appId, query)) as { id: string; title: string }[]
}
