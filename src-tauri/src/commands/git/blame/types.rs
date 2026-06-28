use serde::Serialize;
use std::collections::HashMap;

/// Internal porcelain-parser intermediate. One per requested line.
#[derive(Debug, Clone)]
pub struct RawBlameLine {
    pub sha: String,
    pub line_number: u32,
    pub author: String,
    pub author_email: String,
    pub author_time_unix: i64,
    pub summary: String,
}

/// Wire-shape: per-line pointer into the deduplicated commits map.
#[derive(Debug, Clone, Serialize)]
pub struct GitBlameLine {
    pub line: u32,
    pub sha: String,
}

/// Wire-shape: commit-level metadata. Authored fields cloned from the
/// porcelain header; `prNumber` / `workItemId` come from summary parsing.
#[derive(Debug, Clone, Serialize)]
pub struct GitBlameCommit {
    pub sha: String,
    #[serde(rename = "shortSha")]
    pub short_sha: String,
    pub author: String,
    #[serde(rename = "authorEmail")]
    pub author_email: String,
    /// Unix seconds since epoch. The frontend formats locale/relative strings —
    /// keeping the backend free of `chrono` and locale concerns.
    #[serde(rename = "authorTimeUnix")]
    pub author_time_unix: i64,
    pub summary: String,
    #[serde(rename = "prNumber", skip_serializing_if = "Option::is_none")]
    pub pr_number: Option<u32>,
}

/// Wire-shape: full blame response for a line range.
#[derive(Debug, Clone, Serialize)]
pub struct GitBlameResponse {
    pub lines: Vec<GitBlameLine>,
    pub commits: HashMap<String, GitBlameCommit>,
}
