export interface PanelAIConfig {
  /** Override the default chat model for this panel */
  model?: string
  /** Master toggle — when false, no tools are sent to the API */
  enableTools: boolean
  /** Maximum number of tools to send (default 128) */
  maxTools: number
  /** Include repo filesystem tools (read_file, grep_search, etc.) */
  enableRepoTools: boolean
  /** Include tools from connected MCP servers */
  enableMcpTools: boolean
}
