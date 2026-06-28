use serde_json::Value;
use std::fs;
use std::path::PathBuf;

/// Returns the tool definitions array for the AI provider's `tools` parameter.
pub fn get_tool_definitions() -> Vec<Value> {
    vec![
        serde_json::json!({
            "type": "function",
            "function": {
                "name": "read_file",
                "description": "Read the contents of a file. Returns the text content. Use start_line and end_line to read specific sections of large files.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "file_path": {
                            "type": "string",
                            "description": "Relative path to the file from the repo root"
                        },
                        "start_line": {
                            "type": "integer",
                            "description": "1-based line number to start reading from (optional)"
                        },
                        "end_line": {
                            "type": "integer",
                            "description": "1-based inclusive line number to stop reading at (optional)"
                        }
                    },
                    "required": ["file_path"]
                }
            }
        }),
        serde_json::json!({
            "type": "function",
            "function": {
                "name": "list_directory",
                "description": "List the contents of a directory. Returns file and folder names. Use this to understand project structure.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "path": {
                            "type": "string",
                            "description": "Relative path to the directory from repo root. Use '.' or '' for root."
                        }
                    },
                    "required": ["path"]
                }
            }
        }),
        serde_json::json!({
            "type": "function",
            "function": {
                "name": "grep_search",
                "description": "Search for a pattern in file contents across the repository. Returns matching lines with context. Use for finding specific code, functions, variables, or text patterns.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "pattern": {
                            "type": "string",
                            "description": "The search pattern (case-insensitive substring match by default)"
                        },
                        "include_pattern": {
                            "type": "string",
                            "description": "Glob pattern to filter files (e.g. '*.ts', '*.rs', 'src/**/*.tsx')"
                        },
                        "is_regex": {
                            "type": "boolean",
                            "description": "If true, treat pattern as a regex"
                        }
                    },
                    "required": ["pattern"]
                }
            }
        }),
        serde_json::json!({
            "type": "function",
            "function": {
                "name": "find_files",
                "description": "Find files by name or path pattern using glob matching. Returns a list of matching file paths.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "pattern": {
                            "type": "string",
                            "description": "Glob pattern to match file names or paths (e.g. '*.tsx', '**/hooks/*.ts', 'package.json')"
                        }
                    },
                    "required": ["pattern"]
                }
            }
        }),
        serde_json::json!({
            "type": "function",
            "function": {
                "name": "list_repo_files",
                "description": "List all code files in the repository. Returns relative file paths. Good for getting an overview of the project structure. Skips binary files, node_modules, .git, etc.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "max_results": {
                            "type": "integer",
                            "description": "Maximum number of files to return (default 500)"
                        }
                    }
                }
            }
        }),
        serde_json::json!({
            "type": "function",
            "function": {
                "name": "git_status",
                "description": "Get the current git status showing changed, added, and deleted files.",
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
                "description": "Get recent git commit history.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "max_count": {
                            "type": "integer",
                            "description": "Maximum number of commits to return (default 20)"
                        }
                    }
                }
            }
        }),
    ]
}

/// Returns tool definitions for slash-command tools that can be executed locally.
/// Only includes definitions for the requested tool names.
pub fn get_command_tool_definitions(tool_names: &[String]) -> Vec<Value> {
    let mut defs = Vec::new();
    for name in tool_names {
        match name.as_str() {
            "crawl_webpage" => defs.push(serde_json::json!({
                "type": "function",
                "function": {
                    "name": "crawl_webpage",
                    "description": "Crawl a webpage and extract its full text content, title, description, and links. Use this when the user asks you to read, analyze, or summarize a webpage.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "url": {
                                "type": "string",
                                "description": "The full URL of the webpage to crawl (must start with http:// or https://)"
                            }
                        },
                        "required": ["url"]
                    }
                }
            })),
            "search_images" => defs.push(serde_json::json!({
                "type": "function",
                "function": {
                    "name": "search_images",
                    "description": "Search the open web (Wikimedia Commons) for permissively-licensed images matching a query. Returns a list of candidate images with direct URLs you can embed in markdown via ![alt](url). Use this when writing a book chapter and you need a real photo, diagram, portrait, map, or scientific illustration.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Short, focused image search query (e.g. 'Alan Turing portrait', 'mitochondria electron micrograph', 'event loop diagram')."
                            },
                            "count": {
                                "type": "integer",
                                "description": "Optional. Max number of results to return (1-10). Defaults to 5.",
                                "minimum": 1,
                                "maximum": 10
                            }
                        },
                        "required": ["query"]
                    }
                }
            })),
            _ => {} // Unknown command tool — skip
        }
    }
    defs
}

const MAX_TOOL_RESULT_CHARS: usize = 8000;

/// Execute a tool by name with the given arguments, scoped to repo_path.
/// Returns the tool result as a string.
pub fn execute_tool(tool_name: &str, args: &Value, repo_path: &str) -> String {
    let result = match tool_name {
        "read_file" => exec_read_file(args, repo_path),
        "list_directory" => exec_list_directory(args, repo_path),
        "grep_search" => exec_grep_search(args, repo_path),
        "find_files" => exec_find_files(args, repo_path),
        "list_repo_files" => exec_list_repo_files(args, repo_path),
        "git_status" => exec_git_status(repo_path),
        "git_log" => exec_git_log(args, repo_path),
        _ => format!("Unknown tool: {tool_name}"),
    };

    // Truncate to prevent context explosion
    if result.len() > MAX_TOOL_RESULT_CHARS {
        format!("{}...\n\n[Truncated — result was {} chars, showing first {}]",
            &result[..MAX_TOOL_RESULT_CHARS], result.len(), MAX_TOOL_RESULT_CHARS)
    } else {
        result
    }
}

fn safe_path(repo_path: &str, relative: &str) -> Option<PathBuf> {
    let root = PathBuf::from(repo_path).canonicalize().ok()?;
    let cleaned = relative.trim_start_matches('/').trim_start_matches("./");
    let full = root.join(cleaned).canonicalize().ok()?;
    if full.starts_with(&root) {
        Some(full)
    } else {
        None // Path traversal blocked
    }
}

fn exec_read_file(args: &Value, repo_path: &str) -> String {
    let file_path = match args["file_path"].as_str() {
        Some(p) => p,
        None => return "Error: file_path is required".to_string(),
    };

    let full_path = match safe_path(repo_path, file_path) {
        Some(p) => p,
        None => return format!("Error: invalid or disallowed path '{file_path}'"),
    };

    let meta = match fs::metadata(&full_path) {
        Ok(m) => m,
        Err(e) => return format!("Error reading '{file_path}': {e}"),
    };

    if meta.len() > 2 * 1024 * 1024 {
        return format!("Error: file '{file_path}' is too large ({}KB, max 2048KB)", meta.len() / 1024);
    }

    let content = match fs::read_to_string(&full_path) {
        Ok(c) => c,
        Err(e) => return format!("Error reading '{file_path}': {e}"),
    };

    let lines: Vec<&str> = content.lines().collect();
    let start = args["start_line"].as_u64().map(|n| (n as usize).saturating_sub(1)).unwrap_or(0);
    let end = args["end_line"].as_u64().map(|n| n as usize).unwrap_or(lines.len());
    let end = end.min(lines.len());

    if start >= lines.len() {
        return format!("Error: start_line {} exceeds file length ({} lines)", start + 1, lines.len());
    }

    let selected: Vec<&str> = lines[start..end].to_vec();
    let header = if start > 0 || end < lines.len() {
        format!("File: {file_path} (lines {}-{} of {})\n", start + 1, end, lines.len())
    } else {
        format!("File: {file_path} ({} lines)\n", lines.len())
    };

    format!("{header}{}", selected.join("\n"))
}

fn exec_list_directory(args: &Value, repo_path: &str) -> String {
    let path = args["path"].as_str().unwrap_or(".");
    let full_path = if path == "." || path.is_empty() {
        PathBuf::from(repo_path)
    } else {
        match safe_path(repo_path, path) {
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
                    if e.path().is_dir() {
                        format!("{name}/")
                    } else {
                        name
                    }
                })
                .collect();
            items.sort();
            format!("Directory: {path}\n{}", items.join("\n"))
        }
        Err(e) => format!("Error listing '{path}': {e}"),
    }
}

fn exec_grep_search(args: &Value, repo_path: &str) -> String {
    let pattern = match args["pattern"].as_str() {
        Some(p) => p,
        None => return "Error: pattern is required".to_string(),
    };

    let root = PathBuf::from(repo_path);
    let include_pattern = args["include_pattern"].as_str().map(|s| s.to_string());
    let is_regex = args["is_regex"].as_bool().unwrap_or(false);

    let regex = if is_regex {
        match regex::RegexBuilder::new(pattern).case_insensitive(true).build() {
            Ok(r) => Some(r),
            Err(e) => return format!("Error: invalid regex: {e}"),
        }
    } else {
        None
    };

    let pattern_lower = pattern.to_lowercase();
    let all_files = crate::file_walker::collect_repo_files(&root);
    let glob = include_pattern.as_ref().and_then(|p| glob::Pattern::new(p).ok());

    let files: Vec<String> = all_files.into_iter().filter(|f| {
        if let Some(ref g) = glob {
            let name = f.rsplit('/').next().unwrap_or(f);
            g.matches(f) || g.matches(name)
        } else {
            true
        }
    }).collect();

    let mut results: Vec<String> = Vec::new();
    let max_matches = 30;

    for file_path in files {
        if results.len() >= max_matches { break; }

        let full = root.join(&file_path);
        if let Ok(meta) = fs::metadata(&full) {
            if meta.len() > 2 * 1024 * 1024 { continue; }
        }
        let content = match fs::read_to_string(&full) {
            Ok(c) => c,
            Err(_) => continue,
        };

        for (i, line) in content.lines().enumerate() {
            if results.len() >= max_matches { break; }
            let matched = if let Some(ref re) = regex {
                re.is_match(line)
            } else {
                line.to_lowercase().contains(&pattern_lower)
            };
            if matched {
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

fn exec_find_files(args: &Value, repo_path: &str) -> String {
    let pattern = match args["pattern"].as_str() {
        Some(p) => p,
        None => return "Error: pattern is required".to_string(),
    };

    let glob = match glob::Pattern::new(pattern) {
        Ok(g) => g,
        Err(e) => return format!("Error: invalid glob pattern: {e}"),
    };

    let root = PathBuf::from(repo_path);
    let all_files = crate::file_walker::collect_repo_files(&root);

    let matches: Vec<&String> = all_files.iter().filter(|f| {
        let name = f.rsplit('/').next().unwrap_or(f);
        glob.matches(f) || glob.matches(name)
    }).take(100).collect();

    if matches.is_empty() {
        format!("No files found matching '{pattern}'")
    } else {
        format!("Found {} files matching '{}':\n{}", matches.len(), pattern, matches.iter().map(|s| s.as_str()).collect::<Vec<_>>().join("\n"))
    }
}

fn exec_list_repo_files(args: &Value, repo_path: &str) -> String {
    let max = args["max_results"].as_u64().unwrap_or(500) as usize;
    let root = PathBuf::from(repo_path);
    let mut files = crate::file_walker::collect_repo_files(&root);
    files.truncate(max);
    format!("Repository has {} files:\n{}", files.len(), files.join("\n"))
}

fn exec_git_status(repo_path: &str) -> String {
    match crate::commands::run_git(repo_path, &["status", "--porcelain", "-uall"]) {
        Ok(output) => {
            if output.trim().is_empty() {
                "Working tree clean — no changes".to_string()
            } else {
                format!("Git status:\n{output}")
            }
        }
        Err(e) => format!("Error: {e}"),
    }
}

fn exec_git_log(args: &Value, repo_path: &str) -> String {
    let max = args["max_count"].as_u64().unwrap_or(20).to_string();
    match crate::commands::run_git(repo_path, &[
        "log", &format!("--max-count={max}"),
        "--format=%h %ad %an: %s", "--date=short",
    ]) {
        Ok(output) => format!("Recent commits:\n{output}"),
        Err(e) => format!("Error: {e}"),
    }
}
