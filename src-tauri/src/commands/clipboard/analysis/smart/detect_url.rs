use regex::Regex;
use std::sync::OnceLock;

/// Detects HTTP(S) and other protocol URLs. Faithful port of the frontend
/// `detectUrl` smart-collection detector.
pub fn detect_url(text: &str) -> bool {
    static URL: OnceLock<Regex> = OnceLock::new();
    static PROTOCOL: OnceLock<Regex> = OnceLock::new();

    let url = URL.get_or_init(|| {
        Regex::new(r#"(?i)https?://[^\s<>"{}|\\^`\[\]]+"#).expect("valid url regex")
    });
    let protocol = PROTOCOL.get_or_init(|| {
        Regex::new(r#"(?i)^(ftp|ssh|ws|wss)://[^\s]+"#).expect("valid protocol regex")
    });

    url.is_match(text) || protocol.is_match(text)
}
