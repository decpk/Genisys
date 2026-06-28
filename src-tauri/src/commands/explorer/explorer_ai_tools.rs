use serde_json::Value;
use std::fs;
use std::path::PathBuf;
#[cfg(unix)]
use std::os::unix::fs::PermissionsExt;

/// Tool definitions for the Explorer AI agent — includes both read and write tools.
pub fn get_explorer_tool_definitions() -> Vec<Value> {
    vec![
        // ─── Read tools ──────────────────────────────────────────
        serde_json::json!({
            "type": "function",
            "function": {
                "name": "list_directory",
                "description": "List the contents of a directory. Returns file and folder names with type indicators (/ suffix for folders). Use this to explore the folder structure.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "path": {
                            "type": "string",
                            "description": "Relative path to the directory from root. Use '.' or '' for root."
                        }
                    },
                    "required": ["path"]
                }
            }
        }),
        serde_json::json!({
            "type": "function",
            "function": {
                "name": "read_file",
                "description": "Read the contents of a file. Use start_line and end_line for large files.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "file_path": {
                            "type": "string",
                            "description": "Relative path to the file from root"
                        },
                        "start_line": { "type": "integer", "description": "1-based start line (optional)" },
                        "end_line": { "type": "integer", "description": "1-based end line (optional)" }
                    },
                    "required": ["file_path"]
                }
            }
        }),
        serde_json::json!({
            "type": "function",
            "function": {
                "name": "find_files",
                "description": "Find files by name or path pattern using glob matching. Returns matching file paths. By default only searches the current folder (depth 0). Increase max_depth to search into subfolders.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "pattern": {
                            "type": "string",
                            "description": "Glob pattern to match file names or paths (e.g. '*.tsx', '**/hooks/*.ts')"
                        },
                        "max_depth": {
                            "type": "integer",
                            "description": "Maximum directory depth to search. 0 = current folder only (default), 1 = include immediate subfolders, etc. Max 8."
                        }
                    },
                    "required": ["pattern"]
                }
            }
        }),
        serde_json::json!({
            "type": "function",
            "function": {
                "name": "grep_search",
                "description": "Search for a text pattern in file contents. Returns matching lines with file paths and line numbers. By default only searches files in the current folder (depth 0). Increase max_depth to search into subfolders.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "pattern": {
                            "type": "string",
                            "description": "The search pattern (case-insensitive substring match)"
                        },
                        "include_pattern": {
                            "type": "string",
                            "description": "Glob pattern to filter files (e.g. '*.ts', '*.json')"
                        },
                        "max_depth": {
                            "type": "integer",
                            "description": "Maximum directory depth to search. 0 = current folder only (default), 1 = include immediate subfolders, etc. Max 8."
                        }
                    },
                    "required": ["pattern"]
                }
            }
        }),
        serde_json::json!({
            "type": "function",
            "function": {
                "name": "get_disk_usage",
                "description": "Get the disk usage (size) of a file or folder. Returns total bytes, file count, and folder count. Use before delete operations to inform the user of impact.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "path": {
                            "type": "string",
                            "description": "Relative path to the file or folder from root. Use '.' for root."
                        }
                    },
                    "required": ["path"]
                }
            }
        }),
        serde_json::json!({
            "type": "function",
            "function": {
                "name": "get_file_info",
                "description": "Get detailed properties for a file or folder, including size, type, created date, modified date, last accessed date, and permissions.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "path": {
                            "type": "string",
                            "description": "Relative path to the file or folder from root. Use '.' for root."
                        }
                    },
                    "required": ["path"]
                }
            }
        }),
        serde_json::json!({
            "type": "function",
            "function": {
                "name": "git_status",
                "description": "Get current Git status for this folder, including branch and changed files.",
                "parameters": {
                    "type": "object",
                    "properties": {}
                }
            }
        }),
        serde_json::json!({
            "type": "function",
            "function": {
                "name": "git_log",
                "description": "Get recent Git commit history. Optionally filter by file path.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "max_count": {
                            "type": "integer",
                            "description": "Maximum number of commits to return (default 20)."
                        },
                        "path": {
                            "type": "string",
                            "description": "Optional relative file path to filter history for a specific file."
                        }
                    }
                }
            }
        }),
        serde_json::json!({
            "type": "function",
            "function": {
                "name": "git_diff",
                "description": "Show Git diff output. Supports working tree diff, staged diff, or diff against a base revision.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "path": {
                            "type": "string",
                            "description": "Optional relative file path to limit the diff to a file."
                        },
                        "staged": {
                            "type": "boolean",
                            "description": "If true, show staged changes (`git diff --cached`)."
                        },
                        "base": {
                            "type": "string",
                            "description": "Optional base revision/commit for comparison (e.g. 'HEAD~1', 'main')."
                        }
                    }
                }
            }
        }),
        serde_json::json!({
            "type": "function",
            "function": {
                "name": "git_show_commit",
                "description": "Show details and patch for a specific commit.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "commit": {
                            "type": "string",
                            "description": "Commit hash or reference (e.g. 'HEAD', 'abc123')."
                        },
                        "max_lines": {
                            "type": "integer",
                            "description": "Maximum number of output lines to return (default 200)."
                        }
                    },
                    "required": ["commit"]
                }
            }
        }),
        serde_json::json!({
            "type": "function",
            "function": {
                "name": "git_branches",
                "description": "List local Git branches. Optionally include remote branches.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "include_remote": {
                            "type": "boolean",
                            "description": "If true, include remote branches (uses `git branch -a`)."
                        }
                    }
                }
            }
        }),

        // ─── Write tools (destructive) ───────────────────────────
        serde_json::json!({
            "type": "function",
            "function": {
                "name": "create_file",
                "description": "[WRITE] Create a new file with the given content. Fails if file already exists. Parent directories are created automatically.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "file_path": {
                            "type": "string",
                            "description": "Relative path for the new file"
                        },
                        "content": {
                            "type": "string",
                            "description": "Content to write to the file"
                        }
                    },
                    "required": ["file_path", "content"]
                }
            }
        }),
        serde_json::json!({
            "type": "function",
            "function": {
                "name": "create_folder",
                "description": "[WRITE] Create a new folder (and any parent directories).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "folder_path": {
                            "type": "string",
                            "description": "Relative path for the new folder"
                        }
                    },
                    "required": ["folder_path"]
                }
            }
        }),
        serde_json::json!({
            "type": "function",
            "function": {
                "name": "delete_item",
                "description": "[DESTRUCTIVE] Delete a file or folder (and all contents if folder). This is irreversible! Only call this AFTER listing affected items and receiving user confirmation.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "path": {
                            "type": "string",
                            "description": "Relative path of the file or folder to delete"
                        }
                    },
                    "required": ["path"]
                }
            }
        }),
        serde_json::json!({
            "type": "function",
            "function": {
                "name": "rename_item",
                "description": "[WRITE] Rename a file or folder. Both paths must be within the root.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "old_path": {
                            "type": "string",
                            "description": "Current relative path"
                        },
                        "new_path": {
                            "type": "string",
                            "description": "New relative path"
                        }
                    },
                    "required": ["old_path", "new_path"]
                }
            }
        }),
        serde_json::json!({
            "type": "function",
            "function": {
                "name": "move_item",
                "description": "[WRITE] Move a file or folder to a new location within the root.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "source": {
                            "type": "string",
                            "description": "Current relative path of the item"
                        },
                        "destination": {
                            "type": "string",
                            "description": "New relative path for the item"
                        }
                    },
                    "required": ["source", "destination"]
                }
            }
        }),
        serde_json::json!({
            "type": "function",
            "function": {
                "name": "copy_item",
                "description": "[WRITE] Copy a file or folder to a new location. Folder copies are recursive.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "source": {
                            "type": "string",
                            "description": "Source relative path"
                        },
                        "destination": {
                            "type": "string",
                            "description": "Destination relative path"
                        }
                    },
                    "required": ["source", "destination"]
                }
            }
        }),
        serde_json::json!({
            "type": "function",
            "function": {
                "name": "run_shell_command",
                "description": "[SHELL] Run an arbitrary shell/terminal command (e.g. build scripts, git commands, package managers). The application will prompt the user to approve the exact command before it runs — you cannot bypass this approval. Always explain what the command does and why before calling this tool. Returns the command's stdout, stderr, and exit code.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "command": {
                            "type": "string",
                            "description": "The full shell command to execute (e.g. 'npm run build', 'git status', 'ls -la')."
                        },
                        "cwd": {
                            "type": "string",
                            "description": "Optional working directory to run the command in. Defaults to the root directory if omitted. May be an absolute path or a path relative to the root."
                        }
                    },
                    "required": ["command"]
                }
            }
        }),
    ]
}

pub const MAX_TOOL_RESULT_CHARS: usize = 8000;

/// Execute an explorer tool by name. Returns the result as a string.
pub fn execute_explorer_tool(tool_name: &str, args: &Value, root_path: &str) -> String {
    let result = match tool_name {
        "list_directory" => exec_list_directory(args, root_path),
        "read_file" => exec_read_file(args, root_path),
        "find_files" => exec_find_files(args, root_path),
        "grep_search" => exec_grep_search(args, root_path),
        "get_disk_usage" => exec_get_disk_usage(args, root_path),
        "get_file_info" => exec_get_file_info(args, root_path),
        "git_status" => exec_git_status(root_path),
        "git_log" => exec_git_log(args, root_path),
        "git_diff" => exec_git_diff(args, root_path),
        "git_show_commit" => exec_git_show_commit(args, root_path),
        "git_branches" => exec_git_branches(args, root_path),
        "create_file" => exec_create_file(args, root_path),
        "create_folder" => exec_create_folder(args, root_path),
        "delete_item" => exec_delete_item(args, root_path),
        "rename_item" => exec_rename_item(args, root_path),
        "move_item" => exec_move_item(args, root_path),
        "copy_item" => exec_copy_item(args, root_path),
        _ => format!("Unknown tool: {tool_name}"),
    };

    if result.len() > MAX_TOOL_RESULT_CHARS {
        format!("{}...\n\n[Truncated — result was {} chars, showing first {}]",
            &result[..MAX_TOOL_RESULT_CHARS], result.len(), MAX_TOOL_RESULT_CHARS)
    } else {
        result
    }
}

/// Execute an arbitrary shell command. This must only be called AFTER the user
/// has explicitly approved the command via the confirmation UI.
/// Runs the command via the system shell, captures stdout/stderr/exit code,
/// and returns a formatted, length-capped result string.
pub fn exec_shell_command(command: &str, cwd: Option<&str>, root_path: &str) -> String {
    use std::process::Command;

    // Resolve working directory: explicit cwd (absolute or relative to root) or root.
    let work_dir: PathBuf = match cwd {
        Some(c) if !c.trim().is_empty() => {
            let p = PathBuf::from(c);
            if p.is_absolute() {
                p
            } else {
                PathBuf::from(root_path).join(c)
            }
        }
        _ => PathBuf::from(root_path),
    };

    #[cfg(windows)]
    let output = Command::new("cmd")
        .arg("/C")
        .arg(command)
        .current_dir(&work_dir)
        .output();

    #[cfg(not(windows))]
    let output = Command::new("sh")
        .arg("-c")
        .arg(command)
        .current_dir(&work_dir)
        .output();

    let result = match output {
        Ok(out) => {
            let stdout = String::from_utf8_lossy(&out.stdout);
            let stderr = String::from_utf8_lossy(&out.stderr);
            let code = out
                .status
                .code()
                .map(|c| c.to_string())
                .unwrap_or_else(|| "unknown (terminated by signal)".to_string());
            let mut s = format!(
                "Command: {command}\nWorking directory: {}\nExit code: {code}\n",
                work_dir.display()
            );
            if !stdout.trim().is_empty() {
                s.push_str(&format!("\n--- stdout ---\n{}", stdout.trim_end()));
            }
            if !stderr.trim().is_empty() {
                s.push_str(&format!("\n--- stderr ---\n{}", stderr.trim_end()));
            }
            if stdout.trim().is_empty() && stderr.trim().is_empty() {
                s.push_str("\n(no output)");
            }
            s
        }
        Err(e) => format!("Failed to execute command '{command}': {e}"),
    };

    if result.len() > MAX_TOOL_RESULT_CHARS {
        format!(
            "{}...\n\n[Truncated — result was {} chars, showing first {}]",
            &result[..MAX_TOOL_RESULT_CHARS],
            result.len(),
            MAX_TOOL_RESULT_CHARS
        )
    } else {
        result
    }
}

fn safe_path(root_path: &str, relative: &str) -> Option<PathBuf> {
    let root = PathBuf::from(root_path).canonicalize().ok()?;
    let cleaned = relative.trim_start_matches('/').trim_start_matches("./");
    let full = root.join(cleaned).canonicalize().ok()?;
    if full.starts_with(&root) {
        Some(full)
    } else {
        None
    }
}

// ─── Read tool implementations ──────────────────────────────────

fn exec_list_directory(args: &Value, root_path: &str) -> String {
    let path = args["path"].as_str().unwrap_or(".");
    let full_path = if path == "." || path.is_empty() {
        PathBuf::from(root_path)
    } else {
        match safe_path(root_path, path) {
            Some(p) => p,
            None => return format!("Error: invalid or disallowed path '{path}'"),
        }
    };

    match fs::read_dir(&full_path) {
        Ok(entries) => {
            let mut items: Vec<String> = entries
                .filter_map(|e| e.ok())
                .map(|e| {
                    let name = e.file_name().to_string_lossy().to_string();
                    if e.path().is_dir() { format!("{name}/") } else { name }
                })
                .collect();
            items.sort();
            format!("Directory: {path}\n{}", items.join("\n"))
        }
        Err(e) => format!("Error listing '{path}': {e}"),
    }
}

fn exec_read_file(args: &Value, root_path: &str) -> String {
    let file_path = match args["file_path"].as_str() {
        Some(p) => p,
        None => return "Error: file_path is required".to_string(),
    };
    let full_path = match safe_path(root_path, file_path) {
        Some(p) => p,
        None => return format!("Error: invalid or disallowed path '{file_path}'"),
    };
    let meta = match fs::metadata(&full_path) {
        Ok(m) => m,
        Err(e) => return format!("Error reading '{file_path}': {e}"),
    };
    if meta.len() > 2 * 1024 * 1024 {
        return format!("Error: file too large ({}KB, max 2048KB)", meta.len() / 1024);
    }
    let content = match fs::read_to_string(&full_path) {
        Ok(c) => c,
        Err(e) => return format!("Error reading '{file_path}': {e}"),
    };
    let lines: Vec<&str> = content.lines().collect();
    let start = args["start_line"].as_u64().map(|n| (n as usize).saturating_sub(1)).unwrap_or(0);
    let end = args["end_line"].as_u64().map(|n| n as usize).unwrap_or(lines.len()).min(lines.len());
    if start >= lines.len() {
        return format!("Error: start_line {} exceeds file length ({} lines)", start + 1, lines.len());
    }
    let selected: Vec<&str> = lines[start..end].to_vec();
    format!("File: {file_path} ({} lines)\n{}", lines.len(), selected.join("\n"))
}

/// Walk a directory tree breadth-first with limits to avoid hanging on huge directories.
/// Returns (relative_path, is_dir) pairs. Prioritizes shallow items first.
/// Stops after `max_entries` total items or `max_depth` levels deep.
fn walk_bounded(root: &PathBuf, max_entries: usize, max_depth: usize) -> Vec<(String, bool)> {
    let mut results = Vec::new();
    // BFS queue: (absolute_path, depth) — breadth-first so root-level items come first
    let mut queue: std::collections::VecDeque<(PathBuf, usize)> = std::collections::VecDeque::new();
    queue.push_back((root.clone(), 0));

    while let Some((dir, depth)) = queue.pop_front() {
        if results.len() >= max_entries { break; }
        if let Ok(entries) = fs::read_dir(&dir) {
            for entry in entries.filter_map(|e| e.ok()) {
                if results.len() >= max_entries { break; }
                let path = entry.path();
                let is_dir = path.is_dir();
                if let Ok(rel) = path.strip_prefix(root) {
                    results.push((rel.to_string_lossy().to_string(), is_dir));
                }
                if is_dir && depth < max_depth {
                    let name = entry.file_name().to_string_lossy().to_string();
                    // Skip known heavy directories
                    if !matches!(name.as_str(), "node_modules" | ".git" | "target" | "dist" | ".next" | "__pycache__" | ".venv" | "venv" | "coverage" | ".cache" | ".turbo") {
                        queue.push_back((path, depth + 1));
                    }
                }
            }
        }
    }
    results
}

fn exec_find_files(args: &Value, root_path: &str) -> String {
    let pattern = match args["pattern"].as_str() {
        Some(p) => p,
        None => return "Error: pattern is required".to_string(),
    };
    let glob = match glob::Pattern::new(pattern) {
        Ok(g) => g,
        Err(e) => return format!("Error: invalid glob pattern: {e}"),
    };
    let root = PathBuf::from(root_path);
    let depth = args["max_depth"].as_u64().unwrap_or(0).min(8) as usize;
    let all_entries = walk_bounded(&root, 10_000, depth);
    let matches: Vec<&str> = all_entries.iter()
        .map(|(path, _)| path.as_str())
        .filter(|f| {
            let name = f.rsplit('/').next().unwrap_or(f);
            glob.matches(f) || glob.matches(name)
        })
        .take(100)
        .collect();

    if matches.is_empty() {
        format!("No files found matching '{pattern}'")
    } else {
        format!("Found {} files matching '{}':\n{}", matches.len(), pattern,
            matches.join("\n"))
    }
}

fn exec_grep_search(args: &Value, root_path: &str) -> String {
    let pattern = match args["pattern"].as_str() {
        Some(p) => p,
        None => return "Error: pattern is required".to_string(),
    };
    let root = PathBuf::from(root_path);
    let include_pattern = args["include_pattern"].as_str().map(|s| s.to_string());
    let pattern_lower = pattern.to_lowercase();
    let depth = args["max_depth"].as_u64().unwrap_or(0).min(8) as usize;
    let all_entries = walk_bounded(&root, 10_000, depth);
    let glob = include_pattern.as_ref().and_then(|p| glob::Pattern::new(p).ok());

    let files: Vec<String> = all_entries.into_iter()
        .filter(|(_, is_dir)| !is_dir)
        .map(|(path, _)| path)
        .filter(|f| {
            if let Some(ref g) = glob {
                let name = f.rsplit('/').next().unwrap_or(f);
                g.matches(f) || g.matches(name)
            } else { true }
        }).collect();

    let mut results: Vec<String> = Vec::new();
    let max_matches = 30;
    for file_path in files {
        if results.len() >= max_matches { break; }
        let full = root.join(&file_path);
        if let Ok(meta) = fs::metadata(&full) {
            if meta.len() > 2 * 1024 * 1024 { continue; }
        }
        let content = match fs::read_to_string(&full) { Ok(c) => c, Err(_) => continue };
        for (i, line) in content.lines().enumerate() {
            if results.len() >= max_matches { break; }
            if line.to_lowercase().contains(&pattern_lower) {
                results.push(format!("{}:{}: {}", file_path, i + 1, line.trim()));
            }
        }
    }

    if results.is_empty() {
        format!("No matches found for '{pattern}'")
    } else {
        format!("Found {} matches for '{}':\n{}", results.len(), pattern, results.join("\n"))
    }
}

fn exec_get_disk_usage(args: &Value, root_path: &str) -> String {
    let path = args["path"].as_str().unwrap_or(".");
    let full = if path == "." || path.is_empty() {
        PathBuf::from(root_path)
    } else {
        match safe_path(root_path, path) {
            Some(p) => p,
            None => return format!("Error: invalid path '{path}'"),
        }
    };

    // Bounded dir_size: stops counting after visiting max_items entries
    fn dir_size_bounded(p: &PathBuf, visited: &mut u64, max_items: u64) -> (u64, u64, u64) {
        let mut bytes: u64 = 0;
        let mut files: u64 = 0;
        let mut folders: u64 = 0;
        if *visited >= max_items { return (bytes, files, folders); }
        if let Ok(entries) = fs::read_dir(p) {
            for entry in entries.filter_map(|e| e.ok()) {
                if *visited >= max_items { break; }
                *visited += 1;
                let ep = entry.path();
                if ep.is_dir() {
                    folders += 1;
                    let (b, f, d) = dir_size_bounded(&ep, visited, max_items);
                    bytes += b; files += f; folders += d;
                } else {
                    files += 1;
                    if let Ok(meta) = ep.metadata() { bytes += meta.len(); }
                }
            }
        }
        (bytes, files, folders)
    }

    fn format_size(bytes: u64) -> String {
        if bytes < 1024 { format!("{bytes} B") }
        else if bytes < 1024 * 1024 { format!("{:.1} KB", bytes as f64 / 1024.0) }
        else if bytes < 1024 * 1024 * 1024 { format!("{:.1} MB", bytes as f64 / (1024.0 * 1024.0)) }
        else { format!("{:.2} GB", bytes as f64 / (1024.0 * 1024.0 * 1024.0)) }
    }

    if full.is_dir() {
        let mut visited: u64 = 0;
        let max_items: u64 = 50_000;
        let (bytes, files, folders) = dir_size_bounded(&full, &mut visited, max_items);
        let approx = if visited >= max_items { " (approximate — directory too large to fully scan)" } else { "" };
        format!("Path: {path} (folder)\nSize: {} ({bytes} bytes){approx}\nFiles: {files}\nSubfolders: {folders}",
            format_size(bytes))
    } else {
        let bytes = fs::metadata(&full).map(|m| m.len()).unwrap_or(0);
        format!("Path: {path} (file)\nSize: {} ({bytes} bytes)", format_size(bytes))
    }
}

fn exec_get_file_info(args: &Value, root_path: &str) -> String {
    let path = args["path"].as_str().unwrap_or(".");
    let full = if path == "." || path.is_empty() {
        PathBuf::from(root_path)
    } else {
        match safe_path(root_path, path) {
            Some(p) => p,
            None => return format!("Error: invalid path '{path}'"),
        }
    };

    let meta = match fs::symlink_metadata(&full) {
        Ok(m) => m,
        Err(e) => return format!("Error reading metadata for '{path}': {e}"),
    };

    fn format_size(bytes: u64) -> String {
        if bytes < 1024 { format!("{bytes} B") }
        else if bytes < 1024 * 1024 { format!("{:.1} KB", bytes as f64 / 1024.0) }
        else if bytes < 1024 * 1024 * 1024 { format!("{:.1} MB", bytes as f64 / (1024.0 * 1024.0)) }
        else { format!("{:.2} GB", bytes as f64 / (1024.0 * 1024.0 * 1024.0)) }
    }

    fn format_system_time(st: Result<std::time::SystemTime, std::io::Error>) -> String {
        st.ok()
            .map(|t| chrono::DateTime::<chrono::Utc>::from(t).to_rfc3339())
            .unwrap_or_else(|| "N/A".to_string())
    }

    let file_type = meta.file_type();
    let kind = if file_type.is_symlink() {
        "symlink"
    } else if file_type.is_dir() {
        "folder"
    } else {
        "file"
    };

    let size_bytes = if file_type.is_dir() { 0 } else { meta.len() };
    let created = format_system_time(meta.created());
    let modified = format_system_time(meta.modified());
    let accessed = format_system_time(meta.accessed());
    let readonly = meta.permissions().readonly();

    #[cfg(unix)]
    let mode = format!("{:o}", meta.permissions().mode());
    #[cfg(not(unix))]
    let mode = "N/A".to_string();

    format!(
        "Path: {path}\nType: {kind}\nSize: {} ({size_bytes} bytes)\nCreated: {created}\nModified: {modified}\nAccessed: {accessed}\nMode: {mode}\nRead-only: {readonly}",
        format_size(size_bytes)
    )
}

fn clip_text_lines(output: &str, max_lines: usize) -> String {
    let lines: Vec<&str> = output.lines().collect();
    if lines.len() <= max_lines {
        output.to_string()
    } else {
        let shown = lines[..max_lines].join("\n");
        format!(
            "{}\n\n[Truncated — output had {} lines, showing first {}]",
            shown,
            lines.len(),
            max_lines
        )
    }
}

fn format_git_diff_markdown(raw: &str, max_lines: usize) -> String {
    let clipped = clip_text_lines(raw, max_lines);
    format!("```diff\n{}\n```", clipped)
}

fn classify_status_line(line: &str) -> (&'static str, String) {
    if line.len() < 3 {
        return ("unknown", line.to_string());
    }

    let x = line.chars().next().unwrap_or(' ');
    let y = line.chars().nth(1).unwrap_or(' ');
    let file = line[3..].to_string();

    if x == '?' && y == '?' {
        return ("untracked", file);
    }
    if x != ' ' {
        return ("staged", file);
    }
    if y != ' ' {
        return ("unstaged", file);
    }
    ("unknown", file)
}

fn format_git_status_markdown(branch: &str, porcelain: &str) -> String {
    if porcelain.trim().is_empty() {
        if branch.is_empty() {
            return "### Git Status\nWorking tree clean — no changes".to_string();
        }
        return format!("### Git Status\n- Branch: `{branch}`\n- Working tree: clean");
    }

    let mut staged = 0usize;
    let mut unstaged = 0usize;
    let mut untracked = 0usize;
    let mut rows: Vec<(String, String)> = Vec::new();

    for line in porcelain.lines() {
        let (kind, file) = classify_status_line(line);
        match kind {
            "staged" => staged += 1,
            "unstaged" => unstaged += 1,
            "untracked" => untracked += 1,
            _ => {}
        }
        rows.push((kind.to_string(), file));
    }

    let mut out = String::from("### Git Status\n");
    if !branch.is_empty() {
        out.push_str(&format!("- Branch: `{branch}`\n"));
    }
    out.push_str(&format!(
        "- Staged: {} | Unstaged: {} | Untracked: {}\n\n",
        staged, unstaged, untracked
    ));
    out.push_str("| State | File |\n|---|---|\n");

    for (i, (kind, file)) in rows.iter().enumerate() {
        if i >= 80 {
            out.push_str(&format!("\n_Truncated — showing first {} files._", 80));
            break;
        }
        out.push_str(&format!("| {} | `{}` |\n", kind, file.replace('`', "\\`")));
    }
    out
}

fn exec_git_status(root_path: &str) -> String {
    let branch = crate::commands::run_git(root_path, &["branch", "--show-current"])
        .unwrap_or_default()
        .trim()
        .to_string();

    match crate::commands::run_git(root_path, &["status", "--porcelain", "-uall"]) {
        Ok(output) => format_git_status_markdown(&branch, &output),
        Err(e) => format!("Error: {e}"),
    }
}

fn exec_git_log(args: &Value, root_path: &str) -> String {
    let max = args["max_count"].as_u64().unwrap_or(20).to_string();
    let path = args["path"].as_str().map(|p| p.trim()).filter(|p| !p.is_empty());

    let mut cmd: Vec<String> = vec![
        "log".to_string(),
        format!("--max-count={max}"),
        "--format=%h%x1f%ad%x1f%an%x1f%s".to_string(),
        "--date=short".to_string(),
    ];
    if let Some(p) = path {
        cmd.push("--".to_string());
        cmd.push(p.to_string());
    }
    let refs: Vec<&str> = cmd.iter().map(|s| s.as_str()).collect();

    match crate::commands::run_git(root_path, &refs) {
        Ok(output) => {
            if output.trim().is_empty() {
                return "No commits found".to_string();
            }

            let title = if let Some(p) = path {
                format!("### Recent Commits for `{p}`")
            } else {
                "### Recent Commits".to_string()
            };

            let mut rows = String::new();
            rows.push_str("| Commit | Date | Author | Message |\n|---|---|---|---|\n");

            for line in output.lines() {
                let parts: Vec<&str> = line.split('\u{1f}').collect();
                if parts.len() < 4 {
                    continue;
                }
                let hash = parts[0].trim();
                let date = parts[1].trim();
                let author = parts[2].trim().replace('|', "\\|");
                let msg = parts[3].trim().replace('|', "\\|");
                rows.push_str(&format!("| `{}` | {} | {} | {} |\n", hash, date, author, msg));
            }

            format!("{}\n\n{}", title, rows)
        }
        Err(e) => format!("Error: {e}"),
    }
}

fn exec_git_diff(args: &Value, root_path: &str) -> String {
    let path = args["path"].as_str().map(|p| p.trim()).filter(|p| !p.is_empty());
    let staged = args["staged"].as_bool().unwrap_or(false);
    let base = args["base"].as_str().map(|b| b.trim()).filter(|b| !b.is_empty());

    let mut cmd: Vec<String> = vec!["diff".to_string(), "--no-ext-diff".to_string()];
    if staged {
        cmd.push("--cached".to_string());
    }
    if let Some(b) = base {
        cmd.push(b.to_string());
    }
    if let Some(p) = path {
        cmd.push("--".to_string());
        cmd.push(p.to_string());
    }
    let refs: Vec<&str> = cmd.iter().map(|s| s.as_str()).collect();

    match crate::commands::run_git(root_path, &refs) {
        Ok(output) => {
            if output.trim().is_empty() {
                "No diff".to_string()
            } else {
                format_git_diff_markdown(&output, 300)
            }
        }
        Err(e) => format!("Error: {e}"),
    }
}

fn exec_git_show_commit(args: &Value, root_path: &str) -> String {
    let commit = match args["commit"].as_str().map(|s| s.trim()).filter(|s| !s.is_empty()) {
        Some(c) => c,
        None => return "Error: commit is required".to_string(),
    };
    let max_lines = args["max_lines"].as_u64().unwrap_or(200) as usize;
    let max_lines = max_lines.clamp(20, 800);

    match crate::commands::run_git(root_path, &["show", "--no-ext-diff", commit]) {
        Ok(output) => format_git_diff_markdown(&output, max_lines),
        Err(e) => format!("Error: {e}"),
    }
}

fn exec_git_branches(args: &Value, root_path: &str) -> String {
    let include_remote = args["include_remote"].as_bool().unwrap_or(false);
    let cmd = if include_remote {
        vec!["branch", "-a"]
    } else {
        vec!["branch", "--list"]
    };

    match crate::commands::run_git(root_path, &cmd) {
        Ok(output) => {
            if output.trim().is_empty() {
                "No branches found".to_string()
            } else {
                let mut out = String::from("### Branches\n");
                for line in output.lines() {
                    let trimmed = line.trim();
                    if trimmed.is_empty() { continue; }
                    if trimmed.starts_with('*') {
                        out.push_str(&format!("- **{}**\n", trimmed.trim_start_matches('*').trim()));
                    } else {
                        out.push_str(&format!("- {}\n", trimmed));
                    }
                }
                out
            }
        }
        Err(e) => format!("Error: {e}"),
    }
}

// ─── Write tool implementations ─────────────────────────────────

fn exec_create_file(args: &Value, root_path: &str) -> String {
    let file_path = match args["file_path"].as_str() {
        Some(p) => p,
        None => return "Error: file_path is required".to_string(),
    };
    let content = args["content"].as_str().unwrap_or("");
    let root = match PathBuf::from(root_path).canonicalize() {
        Ok(r) => r,
        Err(e) => return format!("Error: invalid root: {e}"),
    };
    let cleaned = file_path.trim_start_matches('/').trim_start_matches("./");
    let full = root.join(cleaned);

    if let Some(parent) = full.parent() {
        if !parent.exists() {
            if let Err(e) = fs::create_dir_all(parent) {
                return format!("Error creating parent dirs: {e}");
            }
        }
        match parent.canonicalize() {
            Ok(cp) if cp.starts_with(&root) => {}
            _ => return "Error: path traversal blocked".to_string(),
        }
    }

    if full.exists() {
        return format!("Error: file already exists: {cleaned}");
    }

    match fs::write(&full, content) {
        Ok(_) => format!("Created file: {cleaned}"),
        Err(e) => format!("Error creating file: {e}"),
    }
}

fn exec_create_folder(args: &Value, root_path: &str) -> String {
    let folder_path = match args["folder_path"].as_str() {
        Some(p) => p,
        None => return "Error: folder_path is required".to_string(),
    };
    let root = match PathBuf::from(root_path).canonicalize() {
        Ok(r) => r,
        Err(e) => return format!("Error: invalid root: {e}"),
    };
    let cleaned = folder_path.trim_start_matches('/').trim_start_matches("./");
    if cleaned.is_empty() {
        return "Error: folder_path cannot be empty".to_string();
    }
    let full = root.join(cleaned);

    match fs::create_dir_all(&full) {
        Ok(_) => {
            match full.canonicalize() {
                Ok(canon) if canon.starts_with(&root) => format!("Created folder: {cleaned}"),
                _ => {
                    let _ = fs::remove_dir(&full);
                    "Error: path traversal blocked".to_string()
                }
            }
        }
        Err(e) => format!("Error creating folder: {e}"),
    }
}

fn exec_delete_item(args: &Value, root_path: &str) -> String {
    let path = match args["path"].as_str() {
        Some(p) => p,
        None => return "Error: path is required".to_string(),
    };
    let root = match PathBuf::from(root_path).canonicalize() {
        Ok(r) => r,
        Err(e) => return format!("Error: invalid root: {e}"),
    };
    let cleaned = path.trim_start_matches('/').trim_start_matches("./");
    if cleaned.is_empty() {
        return "Error: cannot delete root directory".to_string();
    }
    let full = root.join(cleaned);
    let canon = match full.canonicalize() {
        Ok(c) => c,
        Err(e) => return format!("Error: path not found: {e}"),
    };
    if !canon.starts_with(&root) || canon == root {
        return "Error: path traversal blocked".to_string();
    }

    if canon.is_dir() {
        match fs::remove_dir_all(&canon) {
            Ok(_) => format!("Deleted folder: {cleaned}"),
            Err(e) => format!("Error deleting folder: {e}"),
        }
    } else {
        match fs::remove_file(&canon) {
            Ok(_) => format!("Deleted file: {cleaned}"),
            Err(e) => format!("Error deleting file: {e}"),
        }
    }
}

fn exec_rename_item(args: &Value, root_path: &str) -> String {
    let old_path = match args["old_path"].as_str() {
        Some(p) => p,
        None => return "Error: old_path is required".to_string(),
    };
    let new_path = match args["new_path"].as_str() {
        Some(p) => p,
        None => return "Error: new_path is required".to_string(),
    };
    let root = match PathBuf::from(root_path).canonicalize() {
        Ok(r) => r,
        Err(e) => return format!("Error: invalid root: {e}"),
    };

    let old_cleaned = old_path.trim_start_matches('/').trim_start_matches("./");
    let new_cleaned = new_path.trim_start_matches('/').trim_start_matches("./");
    let old_full = root.join(old_cleaned);
    let new_full = root.join(new_cleaned);

    let old_canon = match old_full.canonicalize() {
        Ok(c) => c,
        Err(e) => return format!("Error: source not found: {e}"),
    };
    if !old_canon.starts_with(&root) || old_canon == root {
        return "Error: path traversal blocked on source".to_string();
    }
    if new_full.exists() {
        return format!("Error: destination already exists: {new_cleaned}");
    }

    match fs::rename(&old_canon, &new_full) {
        Ok(_) => format!("Renamed: {old_cleaned} → {new_cleaned}"),
        Err(e) => format!("Error renaming: {e}"),
    }
}

fn exec_move_item(args: &Value, root_path: &str) -> String {
    let source = match args["source"].as_str() {
        Some(p) => p,
        None => return "Error: source is required".to_string(),
    };
    let destination = match args["destination"].as_str() {
        Some(p) => p,
        None => return "Error: destination is required".to_string(),
    };
    let root = match PathBuf::from(root_path).canonicalize() {
        Ok(r) => r,
        Err(e) => return format!("Error: invalid root: {e}"),
    };

    let src_cleaned = source.trim_start_matches('/').trim_start_matches("./");
    let dst_cleaned = destination.trim_start_matches('/').trim_start_matches("./");
    let src_full = root.join(src_cleaned);
    let dst_full = root.join(dst_cleaned);

    let src_canon = match src_full.canonicalize() {
        Ok(c) => c,
        Err(e) => return format!("Error: source not found: {e}"),
    };
    if !src_canon.starts_with(&root) || src_canon == root {
        return "Error: path traversal blocked on source".to_string();
    }

    if let Some(parent) = dst_full.parent() {
        if !parent.exists() {
            if let Err(e) = fs::create_dir_all(parent) {
                return format!("Error creating destination directory: {e}");
            }
        }
        match parent.canonicalize() {
            Ok(cp) if cp.starts_with(&root) => {}
            _ => return "Error: path traversal blocked on destination".to_string(),
        }
    }
    if dst_full.exists() {
        return format!("Error: destination already exists: {dst_cleaned}");
    }

    match fs::rename(&src_canon, &dst_full) {
        Ok(_) => format!("Moved: {src_cleaned} → {dst_cleaned}"),
        Err(e) => format!("Error moving: {e}"),
    }
}

fn exec_copy_item(args: &Value, root_path: &str) -> String {
    let source = match args["source"].as_str() {
        Some(p) => p,
        None => return "Error: source is required".to_string(),
    };
    let destination = match args["destination"].as_str() {
        Some(p) => p,
        None => return "Error: destination is required".to_string(),
    };
    let root = match PathBuf::from(root_path).canonicalize() {
        Ok(r) => r,
        Err(e) => return format!("Error: invalid root: {e}"),
    };

    let src_cleaned = source.trim_start_matches('/').trim_start_matches("./");
    let dst_cleaned = destination.trim_start_matches('/').trim_start_matches("./");
    let src_full = root.join(src_cleaned);
    let dst_full = root.join(dst_cleaned);

    let src_canon = match src_full.canonicalize() {
        Ok(c) => c,
        Err(e) => return format!("Error: source not found: {e}"),
    };
    if !src_canon.starts_with(&root) || src_canon == root {
        return "Error: path traversal blocked on source".to_string();
    }
    if let Some(parent) = dst_full.parent() {
        if !parent.exists() {
            if let Err(e) = fs::create_dir_all(parent) {
                return format!("Error creating destination directory: {e}");
            }
        }
    }
    if dst_full.exists() {
        return format!("Error: destination already exists: {dst_cleaned}");
    }

    if src_canon.is_dir() {
        fn copy_dir(src: &PathBuf, dst: &PathBuf) -> Result<u64, String> {
            fs::create_dir_all(dst).map_err(|e| e.to_string())?;
            let mut count: u64 = 0;
            for entry in fs::read_dir(src).map_err(|e| e.to_string())? {
                let entry = entry.map_err(|e| e.to_string())?;
                let sp = entry.path();
                let dp = dst.join(entry.file_name());
                if sp.is_dir() {
                    count += copy_dir(&sp, &dp)?;
                } else {
                    fs::copy(&sp, &dp).map_err(|e| e.to_string())?;
                    count += 1;
                }
            }
            Ok(count)
        }
        match copy_dir(&src_canon, &dst_full) {
            Ok(count) => format!("Copied folder: {src_cleaned} → {dst_cleaned} ({count} files)"),
            Err(e) => format!("Error copying folder: {e}"),
        }
    } else {
        match fs::copy(&src_canon, &dst_full) {
            Ok(_) => format!("Copied file: {src_cleaned} → {dst_cleaned}"),
            Err(e) => format!("Error copying file: {e}"),
        }
    }
}
