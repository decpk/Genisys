// Shared internal state for the generic filesystem watcher.
//
// Holds the singleton registry of watched roots, the debouncer state per
// root, the gitignore builder, plus path classification + exclude helpers.
// All items are crate-internal (`pub(super)`) — only `fs_watcher.rs` and
// its sibling files may use them.

use ignore::gitignore::{Gitignore, GitignoreBuilder};
use notify_debouncer_mini::Debouncer;
use std::collections::HashMap;
use std::path::Path;
use std::sync::{Mutex, OnceLock};
use std::time::Instant;

pub(super) const DEBOUNCE_MS: u64 = 300;
pub(super) const SELF_WRITE_WINDOW_MS: u128 = 500;

pub(super) const EXTRA_EXCLUDES: &[&str] = &[
    "target",
    "node_modules",
    "dist",
    "build",
    ".next",
    ".git/objects",
    ".git/lfs",
    ".git/logs",
    ".turbo",
    ".cache",
    ".vite",
    ".genisys-data",
    ".genisys-code-map",
];

pub(super) struct WatcherState {
    pub(super) _debouncer: Debouncer<notify::RecommendedWatcher>,
    pub(super) last_self_write: Instant,
}

pub(super) type Registry = Mutex<HashMap<String, WatcherState>>;

pub(super) fn registry() -> &'static Registry {
    static REG: OnceLock<Registry> = OnceLock::new();
    REG.get_or_init(|| Mutex::new(HashMap::new()))
}

pub(super) fn build_gitignore(root: &Path) -> Gitignore {
    let mut b = GitignoreBuilder::new(root);
    let _ = b.add(root.join(".gitignore"));
    b.build().unwrap_or_else(|_| Gitignore::empty())
}

pub(super) fn classify(path: &Path) -> Option<&'static str> {
    let s = path.to_string_lossy();
    if s.contains("/.git/HEAD") || s.ends_with("/.git/HEAD") || s.ends_with(".git/HEAD") {
        return Some("head");
    }
    if s.contains("/.git/index") || s.ends_with(".git/index") {
        return Some("index");
    }
    if s.contains("/.git/refs/") {
        return Some("refs");
    }
    if s.contains("/.git/MERGE_HEAD") || s.ends_with(".git/MERGE_HEAD") {
        return Some("merge");
    }
    Some("workdir")
}

pub(super) fn is_excluded(rel: &str) -> bool {
    for ex in EXTRA_EXCLUDES {
        if rel == *ex || rel.starts_with(&format!("{ex}/")) || rel.contains(&format!("/{ex}/")) {
            return true;
        }
    }
    false
}
