// Shell command-history reader (for in-app terminal autocomplete).
//
// Reads the user's interactive shell history file and returns a de-duplicated,
// recency-ranked list of past commands. The standalone Terminal app uses this
// to power ghost-text + dropdown autocomplete as the user types at the prompt.
//
// SECURITY (OWASP path traversal): the history file path is resolved entirely
// server-side from `$HOME` + a known filename for the detected shell. The
// frontend only passes an optional `shell` *hint* used to choose the parser and
// default filename — it can NEVER supply an arbitrary path to open.
//
// Command:
//   * cmd_terminal_history_read — return ranked past commands for a shell

use serde_json::{json, Value};
use std::collections::HashMap;
use std::path::PathBuf;

/// Cap on unique commands returned (most recent kept). Bounds payload + memory.
const MAX_ENTRIES: usize = 5000;
/// Skip absurdly long history lines (likely pasted blobs, not real commands).
const MAX_COMMAND_LEN: usize = 4096;

/// Which shell's history format we're parsing.
enum ShellKind {
    Zsh,
    Bash,
    Fish,
}

/// Map a shell path/name to a parser. Defaults to zsh (the macOS default).
fn classify_shell(shell: &str) -> ShellKind {
    let s = shell.to_ascii_lowercase();
    if s.contains("fish") {
        ShellKind::Fish
    } else if s.contains("bash") {
        ShellKind::Bash
    } else {
        ShellKind::Zsh
    }
}

/// Resolve the user's home directory from the environment.
fn home_dir() -> Option<PathBuf> {
    std::env::var_os("HOME")
        .map(PathBuf::from)
        .or_else(|| std::env::var_os("USERPROFILE").map(PathBuf::from))
}

/// Resolve the history file path for a shell. Honours `$HISTFILE` only when it
/// is already present in our process environment (it usually is not, since it's
/// a shell-internal variable) and points to a real file; otherwise falls back
/// to the well-known per-shell default under `$HOME`. Never derives the path
/// from caller-supplied input.
fn history_path(kind: &ShellKind) -> Option<PathBuf> {
    if let Some(histfile) = std::env::var_os("HISTFILE") {
        let p = PathBuf::from(histfile);
        if p.is_file() {
            return Some(p);
        }
    }
    let home = home_dir()?;
    let path = match kind {
        ShellKind::Zsh => home.join(".zsh_history"),
        ShellKind::Bash => home.join(".bash_history"),
        ShellKind::Fish => match std::env::var_os("XDG_DATA_HOME") {
            Some(xdg) => PathBuf::from(xdg).join("fish").join("fish_history"),
            None => home
                .join(".local")
                .join("share")
                .join("fish")
                .join("fish_history"),
        },
    };
    Some(path)
}

/// True when a line ends with an *odd* number of backslashes (zsh stores a
/// multi-line command by escaping the embedded newline with a trailing `\`).
fn ends_with_continuation(s: &str) -> bool {
    s.chars().rev().take_while(|&c| c == '\\').count() % 2 == 1
}

/// Strip the optional zsh EXTENDED_HISTORY metadata prefix `": <ts>:<elapsed>;"`
/// from the start of a history line, returning just the command text.
fn strip_zsh_meta(line: &str) -> &str {
    if let Some(rest) = line.strip_prefix(": ") {
        if let Some(semi) = rest.find(';') {
            let meta = &rest[..semi];
            if !meta.is_empty() && meta.chars().all(|c| c.is_ascii_digit() || c == ':') {
                return &rest[semi + 1..];
            }
        }
    }
    line
}

/// Parse a zsh `.zsh_history` file into commands (oldest → newest), handling the
/// extended-history prefix and backslash-continued multi-line entries.
fn parse_zsh(content: &str) -> Vec<String> {
    let mut out = Vec::new();
    let mut pending: Option<String> = None;
    for raw in content.lines() {
        if let Some(mut acc) = pending.take() {
            // Continuation of a previous multi-line command.
            if ends_with_continuation(raw) {
                acc.push('\n');
                acc.push_str(&raw[..raw.len() - 1]);
                pending = Some(acc);
            } else {
                acc.push('\n');
                acc.push_str(raw);
                out.push(acc);
            }
            continue;
        }
        let cmd = strip_zsh_meta(raw);
        if ends_with_continuation(cmd) {
            pending = Some(cmd[..cmd.len() - 1].to_string());
        } else {
            out.push(cmd.to_string());
        }
    }
    if let Some(acc) = pending.take() {
        out.push(acc);
    }
    out
}

/// Parse a bash `.bash_history` file into commands (oldest → newest). Skips the
/// `#<epoch>` timestamp comment lines written when `HISTTIMEFORMAT` is set.
fn parse_bash(content: &str) -> Vec<String> {
    content
        .lines()
        .filter(|l| {
            !(l.starts_with('#')
                && l[1..]
                    .chars()
                    .next()
                    .map(|c| c.is_ascii_digit())
                    .unwrap_or(false))
        })
        .map(|l| l.to_string())
        .collect()
}

/// Minimal fish history-value unescape (`\\` → `\`, `\n` → newline).
fn unescape_fish(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut chars = s.chars();
    while let Some(c) = chars.next() {
        if c == '\\' {
            match chars.next() {
                Some('n') => out.push('\n'),
                Some('\\') => out.push('\\'),
                Some(other) => out.push(other),
                None => out.push('\\'),
            }
        } else {
            out.push(c);
        }
    }
    out
}

/// Parse a fish `fish_history` (YAML-ish) file into commands (oldest → newest).
fn parse_fish(content: &str) -> Vec<String> {
    content
        .lines()
        .filter_map(|l| l.trim_start().strip_prefix("- cmd: ").map(unescape_fish))
        .collect()
}

/// De-duplicate commands, count frequency, and emit most-recent-first. The
/// frontend treats array order as recency (index 0 = most recent) and uses
/// `count` for frequency ranking.
fn rank(commands: Vec<String>) -> Vec<Value> {
    let mut counts: HashMap<String, u32> = HashMap::new();
    let mut last_index: HashMap<String, usize> = HashMap::new();
    for (i, cmd) in commands.iter().enumerate() {
        let c = cmd.trim();
        if c.is_empty() || c.len() > MAX_COMMAND_LEN {
            continue;
        }
        *counts.entry(c.to_string()).or_insert(0) += 1;
        last_index.insert(c.to_string(), i);
    }
    let mut uniq: Vec<(String, u32, usize)> = counts
        .into_iter()
        .map(|(cmd, count)| {
            let recency = last_index.get(&cmd).copied().unwrap_or(0);
            (cmd, count, recency)
        })
        .collect();
    // Most recent (highest last-seen index) first.
    uniq.sort_by(|a, b| b.2.cmp(&a.2));
    uniq.truncate(MAX_ENTRIES);
    uniq.into_iter()
        .map(|(command, count, _)| json!({ "command": command, "count": count }))
        .collect()
}

/// Read and rank the user's shell command history.
///
/// Returns `{ success: true, data: [{ command, count }] }` ordered most-recent
/// first. An absent or unreadable history file yields an empty list (not an
/// error) so a fresh machine simply has no suggestions.
#[tauri::command]
pub async fn cmd_terminal_history_read(shell: Option<String>) -> Value {
    let kind = match shell {
        Some(s) if !s.is_empty() => classify_shell(&s),
        _ => classify_shell(&std::env::var("SHELL").unwrap_or_default()),
    };
    let path = match history_path(&kind) {
        Some(p) => p,
        None => return json!({ "success": true, "data": [] }),
    };
    if !path.is_file() {
        return json!({ "success": true, "data": [] });
    }
    let content = match std::fs::read(&path) {
        Ok(bytes) => String::from_utf8_lossy(&bytes).into_owned(),
        Err(e) => return json!({ "success": false, "error": format!("read history: {e}") }),
    };
    let commands = match kind {
        ShellKind::Zsh => parse_zsh(&content),
        ShellKind::Bash => parse_bash(&content),
        ShellKind::Fish => parse_fish(&content),
    };
    json!({ "success": true, "data": rank(commands) })
}
