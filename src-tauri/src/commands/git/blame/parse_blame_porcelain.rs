use super::types::RawBlameLine;
use std::collections::HashMap;

/// Parse `git blame --porcelain` output into one `RawBlameLine` per
/// requested source line.
///
/// Porcelain format primer:
/// - Each block begins with `<sha> <orig-line> <final-line> [<group-size>]`.
/// - The first occurrence of a sha is followed by header lines
///   (`author`, `author-mail`, `author-time`, `summary`, …).
/// - Subsequent occurrences of the same sha emit only the sha header
///   line and (sometimes) a `filename` header, then the tab-prefixed
///   content line.
/// - The content line (`\t<source>`) closes a block.
///
/// We cache metadata per sha so every returned line carries author /
/// summary data even when it was borrowed from an earlier block.
pub fn parse_blame_porcelain(raw: &str) -> Vec<RawBlameLine> {
    #[derive(Default, Clone)]
    struct CommitMeta {
        author: String,
        author_email: String,
        author_time_unix: i64,
        summary: String,
    }

    let mut commits: HashMap<String, CommitMeta> = HashMap::new();
    let mut out: Vec<RawBlameLine> = Vec::new();

    let mut current_sha: Option<String> = None;
    let mut current_final_line: u32 = 0;
    let mut pending = CommitMeta::default();
    let mut pending_is_new = false;

    for line in raw.lines() {
        if line.starts_with('\t') {
            // Content line — close the current block.
            if let Some(sha) = current_sha.take() {
                if pending_is_new {
                    commits.insert(sha.clone(), pending.clone());
                    pending_is_new = false;
                }
                let meta = commits.get(&sha).cloned().unwrap_or_default();
                out.push(RawBlameLine {
                    sha,
                    line_number: current_final_line,
                    author: meta.author,
                    author_email: meta.author_email,
                    author_time_unix: meta.author_time_unix,
                    summary: meta.summary,
                });
                pending = CommitMeta::default();
            }
            continue;
        }

        let mut parts = line.splitn(2, ' ');
        let key = parts.next().unwrap_or("");
        let rest = parts.next().unwrap_or("");

        // Block header: 40-hex sha followed by line metadata.
        let is_sha_header =
            key.len() == 40 && key.chars().all(|c| c.is_ascii_hexdigit());
        if is_sha_header {
            current_sha = Some(key.to_string());
            let mut nums = rest.split_whitespace();
            let _orig = nums.next();
            let final_line_str = nums.next().unwrap_or("0");
            current_final_line = final_line_str.parse::<u32>().unwrap_or(0);
            pending_is_new = !commits.contains_key(key);
            continue;
        }

        // Header lines only matter for first-occurrence blocks.
        if !pending_is_new {
            continue;
        }

        match key {
            "author" => pending.author = rest.to_string(),
            "author-mail" => {
                pending.author_email = rest
                    .trim_matches(|c: char| c == '<' || c == '>')
                    .to_string();
            }
            "author-time" => {
                pending.author_time_unix = rest.parse::<i64>().unwrap_or(0);
            }
            "summary" => pending.summary = rest.to_string(),
            _ => {}
        }
    }

    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_single_line_block() {
        let raw = "\
abcdef1234567890abcdef1234567890abcdef12 5 7 1
author Jane Doe
author-mail <jane@example.com>
author-time 1700000000
author-tz +0000
committer Jane Doe
committer-mail <jane@example.com>
committer-time 1700000000
committer-tz +0000
summary Initial blame
filename src/lib.rs
\tfn main() {}
";
            let out = parse_blame_porcelain(raw);
            assert_eq!(out.len(), 1);
            assert_eq!(out[0].sha, "abcdef1234567890abcdef1234567890abcdef12");
            assert_eq!(out[0].line_number, 7);
            assert_eq!(out[0].author, "Jane Doe");
            assert_eq!(out[0].author_email, "jane@example.com");
            assert_eq!(out[0].author_time_unix, 1_700_000_000);
            assert_eq!(out[0].summary, "Initial blame");
    }

    #[test]
    fn dedups_metadata_across_repeated_sha() {
        let raw = "\
abcdef1234567890abcdef1234567890abcdef12 5 7 2
author Jane Doe
author-mail <jane@example.com>
author-time 1700000000
author-tz +0000
summary Initial blame
filename src/lib.rs
\tfn main() {}
abcdef1234567890abcdef1234567890abcdef12 6 8
filename src/lib.rs
\t// inside main
";
            let out = parse_blame_porcelain(raw);
            assert_eq!(out.len(), 2);
            assert_eq!(out[1].author, "Jane Doe");
            assert_eq!(out[1].summary, "Initial blame");
            assert_eq!(out[1].line_number, 8);
    }
}
