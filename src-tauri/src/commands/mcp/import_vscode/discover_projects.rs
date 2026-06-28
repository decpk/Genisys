use serde_json::Value;
use std::collections::HashSet;
use std::fs;
use std::path::PathBuf;
use url::Url;

use super::vscode_db_paths::get_vscode_storage_json_paths;

/// Discover project paths from VS Code's storage.json files.
/// Reads `profileAssociations.workspaces` which contains all workspaces
/// the user has ever opened in VS Code.
/// Scans all VS Code variants (Code, Code Insiders, Cursor).
pub fn discover_vscode_project_paths() -> Vec<PathBuf> {
    let mut all_paths: HashSet<PathBuf> = HashSet::new();

    let storage_paths = get_vscode_storage_json_paths();

    for storage_path in &storage_paths {
        if !storage_path.exists() {
            continue;
        }

        if let Ok(paths) = read_workspace_paths_from_storage(storage_path) {
            for path in paths {
                all_paths.insert(path);
            }
        }
    }

    let result: Vec<PathBuf> = all_paths.into_iter().filter(|p| p.exists()).collect();
    println!(
        "[MCP Import] Discovered {} project paths from VS Code storage",
        result.len()
    );
    result
}

/// Read workspace paths from a VS Code storage.json file.
/// Paths are stored under `profileAssociations.workspaces` as a map of
/// `"file:///path/to/project"` → profile UUID.
fn read_workspace_paths_from_storage(storage_path: &PathBuf) -> Result<Vec<PathBuf>, String> {
    let content = fs::read_to_string(storage_path)
        .map_err(|e| format!("Failed to read storage.json: {e}"))?;

    let parsed: Value =
        serde_json::from_str(&content).map_err(|e| format!("Failed to parse storage.json: {e}"))?;

    let workspaces = match parsed
        .get("profileAssociations")
        .and_then(|pa| pa.get("workspaces"))
        .and_then(|w| w.as_object())
    {
        Some(ws) => ws,
        None => return Ok(Vec::new()),
    };

    let mut paths = Vec::new();

    for (uri, _) in workspaces {
        if let Some(path) = uri_to_path(uri) {
            paths.push(path);
        }
    }

    Ok(paths)
}

/// Convert a file:// URI to a PathBuf.
fn uri_to_path(uri: &str) -> Option<PathBuf> {
    if !uri.starts_with("file://") {
        return None;
    }
    Url::parse(uri)
        .ok()
        .and_then(|u| u.to_file_path().ok())
}
