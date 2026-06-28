use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct McpPreset {
    pub name: String,
    pub label: String,
    pub description: String,
    pub command: String,
    pub args: Vec<String>,
    pub category: String,
    pub env_hint: Vec<String>,
    /// Placeholder args the user must fill in (e.g. "--organization <YOUR_ORG>")
    pub args_hint: Vec<String>,
}

#[tauri::command]
pub fn cmd_mcp_get_presets() -> Vec<McpPreset> {
    vec![
        // ── Public / Community ──────────────────────────
        McpPreset {
            name: "github".into(),
            label: "GitHub".into(),
            description: "GitHub repos, issues, PRs, and search".into(),
            command: "npx".into(),
            args: vec!["-y".into(), "@modelcontextprotocol/server-github".into()],
            category: "community".into(),
            env_hint: vec!["GITHUB_PERSONAL_ACCESS_TOKEN".into()],
            args_hint: vec![],
        },
        McpPreset {
            name: "fetch".into(),
            label: "Web Fetch".into(),
            description: "Fetch and extract content from any web page".into(),
            command: "npx".into(),
            args: vec!["-y".into(), "@modelcontextprotocol/server-fetch".into()],
            category: "community".into(),
            env_hint: vec![],
            args_hint: vec![],
        },
        McpPreset {
            name: "filesystem".into(),
            label: "Filesystem".into(),
            description: "Read/write files on your local filesystem".into(),
            command: "npx".into(),
            args: vec!["-y".into(), "@modelcontextprotocol/server-filesystem".into()],
            category: "community".into(),
            env_hint: vec![],
            args_hint: vec![],
        },
        McpPreset {
            name: "playwright".into(),
            label: "Playwright".into(),
            description: "Browser automation and testing".into(),
            command: "npx".into(),
            args: vec!["-y".into(), "@playwright/mcp@latest".into()],
            category: "community".into(),
            env_hint: vec![],
            args_hint: vec![],
        },
    ]
}
