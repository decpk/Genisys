import type { McpServerSummary, McpServerFormData } from '../McpServersSetting.types'

export async function addMcpServer(form: McpServerFormData): Promise<McpServerSummary[]> {
  const args = form.args.trim() ? form.args.split(/\s+/) : []

  const envPairs: Record<string, string> = {}
  if (form.env.trim()) {
    for (const line of form.env.split('\n')) {
      const eqIdx = line.indexOf('=')
      if (eqIdx > 0) {
        const key = line.slice(0, eqIdx).trim()
        const val = line.slice(eqIdx + 1).trim()
        if (key) envPairs[key] = val
      }
    }
  }

  const config = {
    name: form.name.trim(),
    command: form.command.trim(),
    args,
    env: envPairs,
    transport: 'stdio',
    enabled: form.enabled,
  }

  const result = await window.api.mcpAddServer(config)
  return Array.isArray(result) ? result : []
}
