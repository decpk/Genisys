use super::super::utf16_offset::byte_to_utf16_offset;
use crate::types::SensitivityMatch;
use regex::Regex;
use std::sync::OnceLock;

/// Detects JWT tokens. Faithful port of the frontend `detectJwtToken`
/// sensitive-data detector. Matches are `high`.
pub fn detect_jwt_token(text: &str) -> Vec<SensitivityMatch> {
    static RE: OnceLock<Regex> = OnceLock::new();
    let re = RE.get_or_init(|| {
        Regex::new(r"eyJ[a-zA-Z0-9_\-]{10,}\.eyJ[a-zA-Z0-9_\-]{10,}\.[a-zA-Z0-9_\-]{10,}")
            .expect("valid jwt regex")
    });

    let mut matches = Vec::new();
    for m in re.find_iter(text) {
        matches.push(SensitivityMatch {
            kind: "jwt_token".to_string(),
            label: "JWT Token".to_string(),
            level: "high".to_string(),
            start: byte_to_utf16_offset(text, m.start()),
            end: byte_to_utf16_offset(text, m.end()),
        });
    }
    matches
}
