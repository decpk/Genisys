use std::path::PathBuf;

use ignore::WalkBuilder;

pub const SKIP_DIRS: &[&str] = &[
    "node_modules", ".git", "target", "dist", "build", ".next",
    "__pycache__", ".venv", "venv", ".idea", ".vscode",
    "coverage", ".cache", ".turbo", ".output",
    // Common generated outputs in MS / Rush monorepos.
    "lib", "lib-commonjs", "lib-amd", "lib-esm", "temp", ".rush", ".heft",
];

pub const SKIP_EXTENSIONS: &[&str] = &[
    "png", "jpg", "jpeg", "gif", "webp", "ico", "svg",
    "woff", "woff2", "ttf", "eot",
    "mp3", "mp4", "wav", "mov", "avi",
    "zip", "tar", "gz", "rar", "7z",
    "pdf", "doc", "docx", "xls", "xlsx",
    "lock", "min.js", "min.css",
    "map", "wasm", "dll", "so", "dylib", "exe",
];

fn ext_lower(name: &str) -> String {
    name.rsplit('.').next().unwrap_or("").to_ascii_lowercase()
}

fn is_skipped_hidden(name: &str) -> bool {
    // Preserve original behavior: skip dot-files/dirs except `.env`.
    name.starts_with('.') && name != ".env"
}

fn build_walker(root: &PathBuf) -> ignore::Walk {
    let mut wb = WalkBuilder::new(root);
    wb.hidden(false) // we apply our own dot filter (keeps `.env`)
        .git_ignore(true)
        .git_global(true)
        .git_exclude(true)
        .parents(true)
        .require_git(false)
        .follow_links(false);
    // Prune whole directories the user almost never wants in a code
    // tree (in addition to whatever `.gitignore` already excludes).
    // `filter_entry` runs before descent, so subtrees aren't read.
    wb.filter_entry(|entry| {
        let name = entry.file_name().to_string_lossy();
        if is_skipped_hidden(&name) {
            return false;
        }
        let is_dir = entry.file_type().map(|t| t.is_dir()).unwrap_or(false);
        if is_dir && SKIP_DIRS.contains(&name.as_ref()) {
            return false;
        }
        true
    });
    wb.build()
}

/// Recursively list files in a directory. Honors `.gitignore`,
/// `.git/info/exclude`, and a small built-in skip list of generated
/// output dirs. Returns repository-relative POSIX paths.
pub fn collect_repo_files(root: &PathBuf) -> Vec<String> {
    let mut files = Vec::new();
    walk_repo_files_inner(root, |batch| files.extend(batch.iter().cloned()), 0);
    files
}

/// Streaming variant of `collect_repo_files`. Invokes `on_batch` with
/// chunks of relative paths as they're discovered, so callers can
/// render rows progressively instead of waiting
/// for the entire walk to finish. Returns the total file count.
///
/// `batch_size` controls how many entries accumulate before a flush.
/// Pass `0` to use the default.
pub fn walk_repo_files_stream<F>(root: &PathBuf, batch_size: usize, mut on_batch: F) -> usize
where
    F: FnMut(&[String]),
{
    let mut total = 0usize;
    walk_repo_files_inner(root, |batch| {
        total += batch.len();
        on_batch(batch);
    }, batch_size);
    total
}

fn walk_repo_files_inner<F>(root: &PathBuf, mut flush: F, batch_size: usize)
where
    F: FnMut(&[String]),
{
    let chunk = if batch_size == 0 { 256 } else { batch_size };
    let mut buf: Vec<String> = Vec::with_capacity(chunk);

    for result in build_walker(root) {
        let entry = match result {
            Ok(e) => e,
            Err(_) => continue,
        };
        let file_type = match entry.file_type() {
            Some(ft) => ft,
            None => continue,
        };
        let name = entry.file_name().to_string_lossy();
        if is_skipped_hidden(&name) {
            continue;
        }
        if file_type.is_dir() {
            continue;
        }
        if !file_type.is_file() {
            continue;
        }
        let ext = ext_lower(&name);
        if SKIP_EXTENSIONS.contains(&ext.as_str()) {
            continue;
        }
        let path = entry.path();
        if let Ok(rel) = path.strip_prefix(root) {
            // Normalize to POSIX separators for cross-platform consumers.
            let rel_str = rel.to_string_lossy().replace('\\', "/");
            buf.push(rel_str);
            if buf.len() >= chunk {
                flush(&buf);
                buf.clear();
            }
        }
    }
    if !buf.is_empty() {
        flush(&buf);
    }
}
