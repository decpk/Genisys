use crate::commands::{err_val, run_git_read};
use serde_json::{json, Value};
use std::path::Path;

fn detect_language(path: &str) -> &'static str {
    let ext = Path::new(path)
        .extension()
        .and_then(|s| s.to_str())
        .unwrap_or("")
        .to_lowercase();
    match ext.as_str() {
        "ts" | "tsx" | "mts" | "cts" => "typescript",
        "js" | "jsx" | "mjs" | "cjs" => "javascript",
        "rs" => "rust",
        "py" => "python",
        "go" => "go",
        "java" => "java",
        "json" => "json",
        "md" | "markdown" => "markdown",
        "css" => "css",
        "scss" | "sass" => "scss",
        "html" | "htm" => "html",
        "sh" | "bash" | "zsh" => "shell",
        "yaml" | "yml" => "yaml",
        "toml" => "toml",
        "xml" => "xml",
        "sql" => "sql",
        "c" | "h" => "c",
        "cpp" | "cc" | "hpp" | "hh" => "cpp",
        "rb" => "ruby",
        "php" => "php",
        "swift" => "swift",
        "kt" | "kts" => "kotlin",
        _ => "plaintext",
    }
}

fn read_disk(root: &str, file: &str) -> String {
    let p = Path::new(root).join(file);
    std::fs::read_to_string(&p).unwrap_or_default()
}

fn show_or_empty(root: &str, spec: &str) -> String {
    run_git_read(root, &["show", spec]).unwrap_or_default()
}

#[tauri::command]
pub async fn cmd_git_get_diff(root_path: String, file: String, side: String) -> Value {
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let lang = detect_language(&file);
        let (original, modified) = match side.as_str() {
            "working" => (
                show_or_empty(&root_path, &format!(":{}", file)),
                read_disk(&root_path, &file),
            ),
            "staged" => (
                show_or_empty(&root_path, &format!("HEAD:{}", file)),
                show_or_empty(&root_path, &format!(":{}", file)),
            ),
            "head" => (
                show_or_empty(&root_path, &format!("HEAD:{}", file)),
                read_disk(&root_path, &file),
            ),
            other => return Err(format!("unknown side: {other}")),
        };
        Ok(json!({
            "original": original,
            "modified": modified,
            "language": lang,
        }))
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
