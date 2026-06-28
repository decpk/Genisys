use super::super::utf16_offset::byte_to_utf16_offset;
use crate::types::SensitivityMatch;
use regex::Regex;
use std::sync::OnceLock;

/// Detects PEM private-key headers. Faithful port of the frontend
/// `detectPrivateKey` sensitive-data detector.
pub fn detect_private_key(text: &str) -> Vec<SensitivityMatch> {
    static RE: OnceLock<Regex> = OnceLock::new();
    let re = RE.get_or_init(|| {
        Regex::new(r"-----BEGIN\s+(RSA|DSA|EC|OPENSSH|PGP|ENCRYPTED)?\s*PRIVATE KEY-----")
            .expect("valid private-key regex")
    });

    let mut matches = Vec::new();
    for m in re.find_iter(text) {
        matches.push(SensitivityMatch {
            kind: "private_key".to_string(),
            label: "Private Key".to_string(),
            level: "critical".to_string(),
            start: byte_to_utf16_offset(text, m.start()),
            end: byte_to_utf16_offset(text, m.end()),
        });
    }
    matches
}
