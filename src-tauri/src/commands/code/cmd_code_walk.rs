use std::path::PathBuf;

use ignore::WalkBuilder;
use serde_json::{json, Value};

use super::utils::ensure_abs;

const MAX_FILES: usize = 20_000;

const SKIP_DIRS: &[&str] = &[
    "node_modules",
    ".git",
    ".hg",
    ".svn",
    "dist",
    "build",
    "out",
    "target",
    "bin",
    "obj",
    ".next",
    ".nuxt",
    ".svelte-kit",
    ".cache",
    ".parcel-cache",
    ".turbo",
    ".vite",
    "__pycache__",
    ".venv",
    "venv",
    "env",
    ".tox",
    ".pytest_cache",
    ".mypy_cache",
    "vendor",
    "Pods",
    "DerivedData",
    ".gradle",
    ".idea",
    ".vscode",
    ".genisys-data",
];

#[tauri::command]
pub async fn cmd_code_walk(root: String) -> Value {
    let root_path = PathBuf::from(&root);
    if let Err(e) = ensure_abs(&root_path) {
        return json!({ "success": false, "error": e });
    }
    if !root_path.is_dir() {
        return json!({ "success": false, "error": "Root is not a directory" });
    }

    let mut files: Vec<String> = Vec::new();
    let mut truncated = false;

    let walker = WalkBuilder::new(&root_path)
        .git_ignore(false)
        .git_exclude(false)
        .git_global(false)
        .hidden(false)
        .require_git(false)
        .parents(false)
        .ignore(false)
        .filter_entry(|entry| {
            let is_dir = entry.file_type().map(|t| t.is_dir()).unwrap_or(false);
            if !is_dir {
                return true;
            }
            match entry.file_name().to_str() {
                Some(name) => !SKIP_DIRS.contains(&name),
                None => true,
            }
        })
        .build();

    for entry in walker.flatten() {
        if files.len() >= MAX_FILES {
            truncated = true;
            break;
        }
        let path = entry.path();
        let is_file = entry
            .metadata()
            .map(|m| m.is_file())
            .unwrap_or(false);
        if !is_file {
            continue;
        }
        files.push(path.to_string_lossy().to_string());
    }

    json!({ "success": true, "data": { "files": files, "truncated": truncated } })
}
