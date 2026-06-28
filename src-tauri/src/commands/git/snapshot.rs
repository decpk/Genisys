use crate::commands::{err_val, run_git_read};
use serde_json::{json, Value};

/// One-shot git status + branch + ahead/behind. (Perf P1, P6.)
///
/// Wraps `git status --porcelain=v2 --branch --untracked-files=all` and
/// returns pre-categorized buckets so the frontend never re-iterates.
#[tauri::command]
pub async fn cmd_git_snapshot(root_path: String) -> Value {
    let rp = root_path.clone();
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let git_root = run_git_read(&rp, &["rev-parse", "--show-toplevel"])?
            .trim()
            .to_string();
        let out = run_git_read(
            &rp,
            &["status", "--porcelain=v2", "--branch", "--untracked-files=all"],
        )?;
        Ok(parse_snapshot(&git_root, &out))
    })
    .await;

    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}

fn parse_snapshot(git_root: &str, out: &str) -> Value {
    let mut branch: Option<String> = None;
    let mut upstream: Option<String> = None;
    let mut ahead: u32 = 0;
    let mut behind: u32 = 0;
    let mut oid: Option<String> = None;
    let mut detached = false;

    let mut merge: Vec<Value> = Vec::new();
    let mut staged: Vec<Value> = Vec::new();
    let mut unstaged: Vec<Value> = Vec::new();
    let mut untracked: Vec<Value> = Vec::new();

    for line in out.lines() {
        if line.starts_with("# branch.head ") {
            let head = line.trim_start_matches("# branch.head ").trim();
            if head == "(detached)" {
                detached = true;
            } else {
                branch = Some(head.to_string());
            }
        } else if line.starts_with("# branch.upstream ") {
            upstream = Some(
                line.trim_start_matches("# branch.upstream ")
                    .trim()
                    .to_string(),
            );
        } else if line.starts_with("# branch.ab ") {
            // Format: `# branch.ab +N -M`
            let rest = line.trim_start_matches("# branch.ab ").trim();
            let parts: Vec<&str> = rest.split_whitespace().collect();
            if parts.len() == 2 {
                ahead = parts[0].trim_start_matches('+').parse().unwrap_or(0);
                behind = parts[1].trim_start_matches('-').parse().unwrap_or(0);
            }
        } else if line.starts_with("# branch.oid ") {
            let v = line.trim_start_matches("# branch.oid ").trim();
            if v != "(initial)" {
                oid = Some(v.to_string());
            }
        } else if let Some(rest) = line.strip_prefix("1 ") {
            // Ordinary changed entry: `<XY> <sub> <mH> <mI> <mW> <hH> <hI> <path>`
            parse_ordinary(rest, &mut staged, &mut unstaged);
        } else if let Some(rest) = line.strip_prefix("2 ") {
            // Renamed/copied: `<XY> ... <path>\t<orig_path>`
            parse_renamed(rest, &mut staged, &mut unstaged);
        } else if let Some(rest) = line.strip_prefix("u ") {
            // Unmerged (conflict)
            parse_unmerged(rest, &mut merge);
        } else if let Some(rest) = line.strip_prefix("? ") {
            untracked.push(json!({ "path": rest.trim().to_string(), "xy": "??" }));
        }
    }

    json!({
        "gitRoot": git_root,
        "branch": branch.unwrap_or_default(),
        "detached": detached,
        "upstream": upstream,
        "ahead": ahead,
        "behind": behind,
        "oid": oid,
        "hasUpstream": upstream.is_some(),
        "merge": merge,
        "staged": staged,
        "unstaged": unstaged,
        "untracked": untracked,
    })
}

fn parse_ordinary(rest: &str, staged: &mut Vec<Value>, unstaged: &mut Vec<Value>) {
    // `XY sub mH mI mW hH hI path`
    let mut parts = rest.splitn(8, ' ');
    let xy = match parts.next() {
        Some(v) if v.len() == 2 => v,
        _ => return,
    };
    // skip 6 fields
    for _ in 0..6 {
        if parts.next().is_none() { return; }
    }
    let path = match parts.next() {
        Some(p) => p.to_string(),
        None => return,
    };
    let x = xy.chars().next().unwrap_or('.');
    let y = xy.chars().nth(1).unwrap_or('.');
    if x != '.' && x != ' ' {
        staged.push(json!({ "path": path.clone(), "xy": xy }));
    }
    if y != '.' && y != ' ' {
        unstaged.push(json!({ "path": path, "xy": xy }));
    }
}

fn parse_renamed(rest: &str, staged: &mut Vec<Value>, unstaged: &mut Vec<Value>) {
    // `XY sub mH mI mW hH hI Rscore path\torig_path`
    let mut parts = rest.splitn(9, ' ');
    let xy = match parts.next() {
        Some(v) if v.len() == 2 => v,
        _ => return,
    };
    for _ in 0..7 {
        if parts.next().is_none() { return; }
    }
    let tail = match parts.next() {
        Some(p) => p,
        None => return,
    };
    let mut tab_split = tail.splitn(2, '\t');
    let path = tab_split.next().unwrap_or("").to_string();
    let old_path = tab_split.next().map(|s| s.to_string());
    let x = xy.chars().next().unwrap_or('.');
    let y = xy.chars().nth(1).unwrap_or('.');
    if x != '.' && x != ' ' {
        staged.push(json!({ "path": path.clone(), "xy": xy, "oldPath": old_path }));
    }
    if y != '.' && y != ' ' {
        unstaged.push(json!({ "path": path, "xy": xy, "oldPath": old_path }));
    }
}

fn parse_unmerged(rest: &str, merge: &mut Vec<Value>) {
    // `XY sub m1 m2 m3 mW h1 h2 h3 path`
    let mut parts = rest.splitn(10, ' ');
    let xy = match parts.next() {
        Some(v) if v.len() == 2 => v,
        _ => return,
    };
    for _ in 0..8 {
        if parts.next().is_none() { return; }
    }
    let path = match parts.next() {
        Some(p) => p.to_string(),
        None => return,
    };
    merge.push(json!({ "path": path, "xy": xy }));
}
