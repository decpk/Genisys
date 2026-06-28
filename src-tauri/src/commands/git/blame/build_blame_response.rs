use super::extract_pr_number::extract_pr_number;
use super::types::{GitBlameCommit, GitBlameLine, GitBlameResponse, RawBlameLine};
use std::collections::HashMap;

/// Convert parsed porcelain rows into the wire-shape response. Lines
/// become a flat array pointing at a deduplicated `commits` map keyed
/// by full sha. PR numbers are extracted lazily — only when a
/// commit is first inserted into the map.
pub fn build_blame_response(raw_lines: Vec<RawBlameLine>) -> GitBlameResponse {
    let mut lines: Vec<GitBlameLine> = Vec::with_capacity(raw_lines.len());
    let mut commits: HashMap<String, GitBlameCommit> = HashMap::new();

    for raw in raw_lines {
        lines.push(GitBlameLine {
            line: raw.line_number,
            sha: raw.sha.clone(),
        });
        commits.entry(raw.sha.clone()).or_insert_with(|| {
            let short_sha: String = raw.sha.chars().take(7).collect();
            let pr_number = extract_pr_number(&raw.summary);
            GitBlameCommit {
                sha: raw.sha.clone(),
                short_sha,
                author: raw.author.clone(),
                author_email: raw.author_email.clone(),
                author_time_unix: raw.author_time_unix,
                summary: raw.summary.clone(),
                pr_number,
            }
        });
    }

    GitBlameResponse { lines, commits }
}
