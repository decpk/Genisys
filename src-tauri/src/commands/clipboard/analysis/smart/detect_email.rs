use regex::Regex;
use std::sync::OnceLock;

/// Detects email addresses. Faithful port of the frontend `detectEmail`
/// smart-collection detector.
pub fn detect_email(text: &str) -> bool {
    static EMAIL: OnceLock<Regex> = OnceLock::new();
    let email = EMAIL.get_or_init(|| {
        Regex::new(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}").expect("valid email regex")
    });
    email.is_match(text)
}
