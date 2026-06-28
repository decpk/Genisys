// Barrel for the blame submodule. Wiring-only per .claude.md — no
// logic, just module declarations and re-exports.
mod build_blame_response;
mod extract_pr_number;
mod parse_blame_porcelain;
mod run_git_blame_porcelain;
mod types;

pub use build_blame_response::build_blame_response;
pub use parse_blame_porcelain::parse_blame_porcelain;
pub use run_git_blame_porcelain::run_git_blame_porcelain;

// `types` (RawBlameLine / GitBlameLine / GitBlameCommit / GitBlameResponse)
// and the summary extractor (`extract_pr_number`)
// are only consumed inside this submodule — keep them private.
