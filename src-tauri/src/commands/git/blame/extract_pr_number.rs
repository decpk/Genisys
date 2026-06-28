use regex::Regex;
use std::sync::OnceLock;

static MERGED_PR_RE: OnceLock<Regex> = OnceLock::new();
static GH_PR_RE: OnceLock<Regex> = OnceLock::new();

/// Extract the pull-request number from a commit summary.
///
/// Recognised formats (first match wins):
/// - `Merged PR 12345: …` style merge commits
/// - GitHub squash / merge commits: `… (#1234)`
///
/// Returns `None` if no PR reference is present.
pub fn extract_pr_number(summary: &str) -> Option<u32> {
    let merged = MERGED_PR_RE.get_or_init(|| Regex::new(r"(?i)Merged PR (\d+)").unwrap());
    if let Some(caps) = merged.captures(summary) {
        if let Some(m) = caps.get(1) {
            if let Ok(n) = m.as_str().parse::<u32>() {
                return Some(n);
            }
        }
    }
    let gh = GH_PR_RE.get_or_init(|| Regex::new(r"\(#(\d+)\)").unwrap());
    if let Some(caps) = gh.captures(summary) {
        if let Some(m) = caps.get(1) {
            if let Ok(n) = m.as_str().parse::<u32>() {
                return Some(n);
            }
        }
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn matches_merged_pr_commit() {
        assert_eq!(
            extract_pr_number("Merged PR 12345: Improve blame hover"),
            Some(12345)
        );
    }

    #[test]
    fn matches_github_squash_commit() {
        assert_eq!(
            extract_pr_number("Add blame hover (#42)"),
            Some(42)
        );
    }

    #[test]
    fn no_match_returns_none() {
        assert_eq!(extract_pr_number("Plain commit message"), None);
    }
}
