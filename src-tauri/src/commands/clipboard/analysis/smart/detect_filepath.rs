use regex::Regex;
use std::sync::OnceLock;

/// Detects absolute / home file paths. Faithful port of the frontend
/// `detectFilePath` smart-collection detector.
pub fn detect_filepath(text: &str) -> bool {
    let trimmed = text.trim();
    if trimmed.contains('\n') {
        return false;
    }
    if trimmed.chars().count() > 500 {
        return false;
    }

    static UNIX: OnceLock<Regex> = OnceLock::new();
    static WINDOWS: OnceLock<Regex> = OnceLock::new();
    static HOME: OnceLock<Regex> = OnceLock::new();

    let unix = UNIX.get_or_init(|| Regex::new(r"^(/[\w.\-]+){2,}").expect("valid unix-path regex"));
    let windows = WINDOWS
        .get_or_init(|| Regex::new(r"(?i)^[A-Z]:\\[\w.\-]+").expect("valid windows-path regex"));
    let home = HOME.get_or_init(|| Regex::new(r"^~/").expect("valid home-path regex"));

    unix.is_match(trimmed) || windows.is_match(trimmed) || home.is_match(trimmed)
}
