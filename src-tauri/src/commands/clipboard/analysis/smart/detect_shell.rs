use regex::Regex;
use std::sync::OnceLock;

/// Detects shell commands. Faithful port of the frontend `detectShellCommand`
/// smart-collection detector.
///
/// NOTE: the TS `AMBIGUOUS_COMMAND_LINE` pattern uses a positive lookahead
/// `\.{1,2}(?=[/\s]|$)` which the Rust `regex` crate does not support. Because
/// this detector only needs a boolean match, the lookahead is replaced with an
/// equivalent *consuming* group `\.{1,2}(?:[/\s]|$)` — the match position
/// differs by at most one character but the boolean result is identical.
pub fn detect_shell(text: &str) -> bool {
    let trimmed = text.trim();
    let char_len = trimmed.chars().count();
    if char_len < 3 || char_len > 2000 {
        return false;
    }
    if trimmed.split('\n').count() > 20 {
        return false;
    }

    static PREFIX: OnceLock<Regex> = OnceLock::new();
    static STRONG: OnceLock<Regex> = OnceLock::new();
    static AMBIGUOUS: OnceLock<Regex> = OnceLock::new();
    static AMBIGUOUS_OP: OnceLock<Regex> = OnceLock::new();

    let prefix =
        PREFIX.get_or_init(|| Regex::new(r"(?m)^\s*(\$|>|#)\s+\S").expect("valid prefix regex"));
    if prefix.is_match(trimmed) {
        return true;
    }

    let strong = STRONG.get_or_init(|| {
        Regex::new(r"(?m)^\s*(?:sudo\s+)?(git|npm|npx|yarn|pnpm|docker|kubectl|brew|apt|pip|cargo|rustc|gcc|clang|chmod|chown|mkdir|rmdir|xargs|curl|wget|ssh|scp|rsync|tar|zip|unzip)\b\s+\S").expect("valid strong-command regex")
    });
    if strong.is_match(trimmed) {
        return true;
    }

    let ambiguous = AMBIGUOUS.get_or_init(|| {
        Regex::new(r#"(?m)^\s*(?:sudo\s+)?(make|find|cat|cd|cp|mv|rm|ls|echo|source|go|java|node|python|ruby|grep|sed|awk|alias|export)\b\s+(?:-{1,2}[\w-]+|\.{1,2}(?:[/\s]|$)|/[\w/.-]*|~/?|\*|["']|[\w-]+\.[\w-]+|\$[\w{]|\||&&|\|\||>>?|<<?|2>)"#).expect("valid ambiguous-command regex")
    });
    if ambiguous.is_match(trimmed) {
        return true;
    }

    let ambiguous_op = AMBIGUOUS_OP.get_or_init(|| {
        Regex::new(r"(?m)^\s*(?:sudo\s+)?(make|find|cat|cd|cp|mv|rm|ls|echo|source|go|java|node|python|ruby|grep|sed|awk|alias|export)\b[^\n]*\s(?:\||&&|\|\||>>?|<<?|2>)\s").expect("valid ambiguous-operator regex")
    });
    if ambiguous_op.is_match(trimmed) {
        return true;
    }

    false
}
