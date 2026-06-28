export async function fetchMcpTools(): Promise<{ tools: any[]; count: number }> {
  return window.api.mcpListTools()
}
