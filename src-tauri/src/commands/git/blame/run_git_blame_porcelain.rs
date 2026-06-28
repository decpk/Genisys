use crate::commands::run_git_read;

/// Invoke `git blame --porcelain -L <start>,<end> -- <file>` from the
/// given repo root and return raw stdout. Errors are forwarded verbatim
/// from `run_git_read` (which surfaces stderr for non-zero exits).
pub fn run_git_blame_porcelain(
    repo_path: &str,
    file_path: &str,
    start_line: u32,
    end_line: u32,
) -> Result<String, String> {
    let rel = file_path.trim_start_matches('/');
    let range = format!("{},{}", start_line, end_line);
    run_git_read(
        repo_path,
        &["blame", "--porcelain", "-L", &range, "--", rel],
    )
}
