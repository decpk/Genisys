mod ai_provider;
mod chat;
mod library;
mod webpoint;
mod data_management;
mod explorer;
mod git;
mod projects;
mod prompts;
mod prompt_manager;
mod settings;
mod snippets;
mod chat_commands;
mod zoom;
mod keep_awake;
mod db_explorer;
mod research;
mod notifications;
mod news;
mod stocks;
mod api_client;
mod ai_assistant;
mod notes;
mod mock_server;
mod daily_plan;
mod whisper;
mod tts;
mod mcp;
mod clipboard;
mod timer;
mod usage;
mod themes;
mod code;
mod fs_watcher;
pub mod terminal;
pub mod remote_terminal;
pub mod monitor;
pub mod quickshare;
pub mod content_share;
mod previewer;
mod app_lifecycle;
mod messaging;
mod av_permissions;
mod accessibility;

pub use ai_provider::*;
pub use chat::*;
pub use library::*;
pub use webpoint::*;
pub use data_management::*;
pub use explorer::*;
pub use git::*;
pub use projects::*;
pub use prompts::*;
pub use prompt_manager::*;
pub use settings::*;
pub use snippets::*;
pub use chat_commands::*;
pub use zoom::*;
pub use keep_awake::*;
pub use db_explorer::*;
pub use research::*;
pub use notifications::*;
pub use news::*;
pub use stocks::*;
pub use api_client::*;
pub use ai_assistant::*;
pub use notes::*;
pub use mock_server::*;
pub use daily_plan::*;
pub use whisper::*;
pub use tts::*;
pub use mcp::*;
pub use clipboard::*;
pub use timer::*;
pub use usage::*;
pub use themes::*;
pub use code::*;
pub use fs_watcher::*;
pub use terminal::*;
pub use remote_terminal::*;
pub use monitor::*;
pub use quickshare::*;
pub use content_share::*;
pub use previewer::*;
pub use app_lifecycle::*;
pub use messaging::*;
pub use av_permissions::*;
pub use accessibility::*;

use serde_json::Value;
use std::collections::HashMap;
use std::process::{Command, Stdio};
use std::sync::atomic::AtomicU64;
use std::sync::Arc;
use std::sync::Mutex as StdMutex;
use std::sync::OnceLock;

pub struct AppState {
    pub db: Arc<crate::database::Database>,
    /// Pending app-data value for coalesced saves
    pub pending_app_data: StdMutex<Option<Value>>,
    /// Counter to detect if a newer save was queued
    pub app_data_version: AtomicU64,
    /// In-flight API Client HTTP requests, keyed by the client-supplied send id,
    /// so an in-flight request can be aborted mid-flight from the UI via
    /// `cmd_api_cancel_request`. Entries are inserted when a send starts and
    /// removed when it finishes (success, error, or cancel).
    pub api_in_flight:
        StdMutex<std::collections::HashMap<String, tokio_util::sync::CancellationToken>>,
}

// ─── PATH fix for bundled apps ───────────────────────────────────

/// Resolve the user's real login-shell `PATH`, computed once and cached.
///
/// A GUI/Finder launch (the packaged "adhoc" build) starts with the minimal
/// launchd PATH (`/usr/bin:/bin:/usr/sbin:/sbin`), which omits user-specific
/// tool dirs — e.g. CLIs installed by Homebrew, version managers, or under
/// `~/.local/bin`, which are added to PATH only by `~/.zprofile`. Running the
/// login shell once and reading its `$PATH` recovers
/// exactly the PATH the user has in a terminal (where `tauri dev` works),
/// without hardcoding every tool's location.
///
/// Returns `None` if the shell can't be run, errors, or doesn't answer within a
/// short timeout — callers then fall back to the hardcoded locations.
#[cfg(not(windows))]
fn login_shell_path() -> Option<String> {
    static CACHE: OnceLock<Option<String>> = OnceLock::new();
    CACHE.get_or_init(query_login_shell_path).clone()
}

#[cfg(not(windows))]
fn query_login_shell_path() -> Option<String> {
    use std::sync::mpsc;
    use std::time::Duration;

    let shell = std::env::var("SHELL").unwrap_or_else(|_| {
        if std::path::Path::new("/bin/zsh").exists() {
            "/bin/zsh".to_string()
        } else {
            "/bin/bash".to_string()
        }
    });

    // Bracket the value with markers so it can be extracted cleanly even when
    // the user's shell startup files print banners or other noise to stdout.
    const START: &str = "__GENISYS_PATH_START__";
    const END: &str = "__GENISYS_PATH_END__";
    let script = format!("printf '{START}%s{END}' \"$PATH\"");

    // Run the login+interactive shell (`-l` sources ~/.zprofile, `-i` sources
    // ~/.zshrc) on a worker thread so a slow or blocking rc file can't hang the
    // caller indefinitely — a short timeout caps the wait and the result is
    // cached either way, so the shell is spawned at most once per process.
    let (tx, rx) = mpsc::channel();
    std::thread::spawn(move || {
        let out = Command::new(&shell)
            .args(["-ilc", &script])
            .stdin(Stdio::null())
            .output();
        let _ = tx.send(out);
    });

    let output = match rx.recv_timeout(Duration::from_secs(3)) {
        Ok(Ok(o)) => o,
        _ => return None,
    };
    if !output.status.success() {
        return None;
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let start = stdout.find(START)? + START.len();
    let end = stdout[start..].find(END)? + start;
    let path = stdout[start..end].trim();
    (!path.is_empty()).then(|| path.to_string())
}

#[cfg(not(windows))]
pub(crate) fn get_fixed_path() -> String {
    let current = std::env::var("PATH").unwrap_or_default();
    // The user's real login-shell PATH (resolved once, cached). This is what
    // makes user-installed CLIs resolvable in packaged (adhoc) builds launched
    // from Finder, exactly as they are under `tauri dev`.
    let login_path = login_shell_path();

    let extra_paths = [
        "/opt/homebrew/bin",
        "/opt/homebrew/sbin",
        "/usr/local/bin",
        "/usr/bin",
        "/bin",
        "/usr/sbin",
        "/sbin",
    ];

    let mut parts: Vec<&str> = extra_paths.to_vec();
    if let Some(login) = login_path.as_deref() {
        for p in login.split(':') {
            if !p.is_empty() && !parts.contains(&p) {
                parts.push(p);
            }
        }
    }
    for p in current.split(':') {
        if !p.is_empty() && !parts.contains(&p) {
            parts.push(p);
        }
    }
    parts.join(":")
}

/// On Windows the PATH separator is `;` and GUI apps already inherit the
/// machine/user PATH (populated by installers) from the registry. Splitting on
/// `:` like the Unix variant would corrupt drive-letter entries such as
/// `C:\Program Files\...`. Keep the inherited PATH intact.
#[cfg(windows)]
pub(crate) fn get_fixed_path() -> String {
    std::env::var("PATH").unwrap_or_default()
}

#[cfg(not(windows))]
pub(crate) fn cmd_with_path(program: &str) -> Command {
    let mut cmd = Command::new(program);
    cmd.env("PATH", get_fixed_path());
    cmd
}

/// Windows variant of [`cmd_with_path`].
///
/// Many CLIs ship as batch shims on Windows (`npm` -> `npm.cmd`, `code` -> `code.cmd`)
/// which `CreateProcess` cannot launch directly, while Rust's own PATH lookup only
/// appends `.exe`. We resolve the program against PATH + PATHEXT ourselves so batch
/// files are found; Rust (1.77.2+) then runs `.cmd`/`.bat` targets through `cmd.exe`
/// with safe argument escaping. When the program can't be resolved we fall back to
/// the bare name so the resulting NotFound error stays meaningful.
#[cfg(windows)]
pub(crate) fn cmd_with_path(program: &str) -> Command {
    let fixed_path = get_fixed_path();
    let resolved =
        resolve_program_windows(program, &fixed_path).unwrap_or_else(|| program.into());
    let mut cmd = Command::new(resolved);
    cmd.env("PATH", fixed_path);
    cmd
}

#[cfg(windows)]
fn resolve_program_windows(program: &str, path: &str) -> Option<std::path::PathBuf> {
    use std::path::{Path, PathBuf};

    // Respect explicit paths supplied by the caller.
    if program.contains('\\') || program.contains('/') || Path::new(program).is_absolute() {
        let p = PathBuf::from(program);
        return p.is_file().then_some(p);
    }

    // When the caller already includes an executable extension, search for that
    // exact file name on PATH; otherwise resolve a bare command name via PATHEXT.
    let has_ext = Path::new(program).extension().is_some();

    let pathext =
        std::env::var("PATHEXT").unwrap_or_else(|_| ".COM;.EXE;.BAT;.CMD".to_string());
    let extensions: Vec<&str> = pathext
        .split(';')
        .map(str::trim)
        .filter(|e| !e.is_empty())
        .collect();

    for dir in path.split(';').filter(|p| !p.is_empty()) {
        let base = Path::new(dir);

        if has_ext {
            let candidate = base.join(program);
            if candidate.is_file() {
                return Some(candidate);
            }
            continue;
        }

        // Bare command name: only match real executables resolved via PATHEXT.
        // A same-named *extensionless* sibling must be skipped — e.g. the
        // Git-Bash `az` shell script that lives right next to `az.cmd`. Picking
        // it would hand CreateProcess a non-PE file and fail with
        // "%1 is not a valid Win32 application" (os error 193).
        for ext in &extensions {
            let candidate = base.join(format!("{program}{ext}"));
            if candidate.is_file() {
                return Some(candidate);
            }
        }
    }
    None
}

pub(crate) fn run_git(root: &str, args: &[&str]) -> Result<String, String> {
    let output = cmd_with_path("git").args(args).current_dir(root)
        .output().map_err(|e| e.to_string())?;
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

/// Read-only git invocation. Sets `GIT_OPTIONAL_LOCKS=0` so concurrent
/// writes (from external CLIs) do not block our reads. (Perf P18.)
pub(crate) fn run_git_read(root: &str, args: &[&str]) -> Result<String, String> {
    let output = cmd_with_path("git")
        .env("GIT_OPTIONAL_LOCKS", "0")
        .args(args)
        .current_dir(root)
        .output()
        .map_err(|e| e.to_string())?;
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

/// Mutating git invocation. Retries up to 3 times with 100ms backoff
/// when the failure is `.git/index.lock` busy. (Perf P19.)
pub(crate) fn run_git_write(root: &str, args: &[&str]) -> Result<String, String> {
    let mut last_err = String::new();
    for attempt in 0..3 {
        match run_git(root, args) {
            Ok(out) => return Ok(out),
            Err(e) => {
                let lower = e.to_lowercase();
                let is_lock = lower.contains("index.lock") || lower.contains("unable to create") && lower.contains(".lock");
                if !is_lock { return Err(e); }
                last_err = e;
                if attempt < 2 {
                    std::thread::sleep(std::time::Duration::from_millis(100));
                }
            }
        }
    }
    Err(last_err)
}

pub(crate) fn err_val(e: impl std::fmt::Display) -> Value {
    serde_json::json!({"success": false, "error": e.to_string()})
}
