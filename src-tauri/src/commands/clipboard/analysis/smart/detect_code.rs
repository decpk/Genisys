use regex::Regex;
use std::sync::OnceLock;

/// Conservative source-code detector. Faithful port of the frontend
/// `detectCode` smart-collection detector (drives the "Code Snippets" badge).
pub fn detect_code(text: &str) -> bool {
    if text.chars().count() < 10 {
        return false;
    }

    static KEYWORDS: OnceLock<Regex> = OnceLock::new();
    static PATTERNS: OnceLock<Regex> = OnceLock::new();
    static BRACKETS: OnceLock<Regex> = OnceLock::new();

    let keywords = KEYWORDS.get_or_init(|| {
        Regex::new(r"\b(function|const|let|var|import|export|class|interface|type|return|if|else|for|while|switch|case|try|catch|async|await|def|fn|pub|struct|enum|impl|package|public|private|static|void|int|string|bool|float|println|fmt\.)\b").expect("valid keywords regex")
    });
    let patterns = PATTERNS.get_or_init(|| {
        Regex::new(r"(?m)[{};]\s*$|^\s*(//|#!|/\*|\*/)|=>\s*[{(]|\(\)\s*[{=]|<\w+>|::\w+|\.\w+\(|^\s*@\w+").expect("valid patterns regex")
    });
    let brackets = BRACKETS.get_or_init(|| {
        Regex::new(r"[{}()\[\]]{3,}").expect("valid brackets regex")
    });

    let line_count = text.split('\n').count();
    if line_count < 2 {
        return keywords.is_match(text) && patterns.is_match(text);
    }

    let keyword_match = keywords.is_match(text);
    let pattern_match = patterns.is_match(text);
    let bracket_match = brackets.is_match(text);

    (keyword_match && pattern_match)
        || (keyword_match && bracket_match)
        || (pattern_match && bracket_match)
}
