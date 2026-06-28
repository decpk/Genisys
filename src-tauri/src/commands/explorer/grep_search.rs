use serde_json::Value;
use std::fs;
use std::path::PathBuf;

const MAX_FILE_SIZE: u64 = 2 * 1024 * 1024; // 2MB

#[tauri::command]
pub async fn cmd_grep_search(
    root_path: String,
    pattern: String,
    include_pattern: Option<String>,
    max_results: Option<usize>,
    is_regex: Option<bool>,
) -> Value {
    let max = max_results.unwrap_or(50);
    let use_regex = is_regex.unwrap_or(false);

    let regex = if use_regex {
        match regex::RegexBuilder::new(&pattern).case_insensitive(true).build() {
            Ok(r) => Some(r),
            Err(e) => return crate::commands::err_val(format!("Invalid regex: {e}")),
        }
    } else {
        None
    };

    let pattern_lower = pattern.to_lowercase();
    let root = PathBuf::from(&root_path);

    if !root.is_dir() {
        return crate::commands::err_val("Root path is not a directory");
    }

    // Collect files
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

    let mut results: Vec<Value> = Vec::new();

    for file_path in files {
        if results.len() >= max {
            break;
        }

        let full_path = root.join(&file_path);

        // Skip files larger than 2MB
        if let Ok(meta) = fs::metadata(&full_path) {
            if meta.len() > MAX_FILE_SIZE {
                continue;
            }
        }

        let content = match fs::read_to_string(&full_path) {
            Ok(c) => c,
            Err(_) => continue, // Skip binary/unreadable files
        };

        let lines: Vec<&str> = content.lines().collect();

        for (i, line) in lines.iter().enumerate() {
            if results.len() >= max {
                break;
            }

            let matched = if let Some(ref re) = regex {
                re.is_match(line)
            } else {
                line.to_lowercase().contains(&pattern_lower)
            };

            if matched {
                let ctx_start = i.saturating_sub(2);
                let ctx_end = (i + 3).min(lines.len());

                let context_before: Vec<&str> = lines[ctx_start..i].to_vec();
                let context_after: Vec<&str> = if i + 1 < ctx_end {
                    lines[i + 1..ctx_end].to_vec()
                } else {
                    vec![]
                };

                results.push(serde_json::json!({
                    "filePath": file_path,
                    "lineNumber": i + 1,
                    "lineContent": line,
                    "contextBefore": context_before,
                    "contextAfter": context_after,
                }));
            }
        }
    }

    serde_json::json!({
        "success": true,
        "data": results,
        "totalMatches": results.len(),
    })
}
