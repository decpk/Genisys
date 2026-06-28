use super::super::utf16_offset::byte_to_utf16_offset;
use crate::types::SensitivityMatch;
use regex::Regex;
use std::sync::OnceLock;

/// Detects inline password / secret assignments. Faithful port of the frontend
/// `detectPassword` sensitive-data detector. Matches are `critical`.
pub fn detect_password(text: &str) -> Vec<SensitivityMatch> {
    static PATTERNS: OnceLock<Vec<(Regex, &'static str)>> = OnceLock::new();
    let patterns = PATTERNS.get_or_init(|| {
        vec![
            (
                Regex::new(r#"(?i)(?:password|passwd|pwd)\s*[:=]\s*['"]?[^\s'"]{4,}['"]?"#)
                    .expect("re"),
                "Password",
            ),
            (
                Regex::new(r#"(?i)(?:secret|token|auth)\s*[:=]\s*['"]?[^\s'"]{8,}['"]?"#)
                    .expect("re"),
                "Secret/Token",
            ),
        ]
    });

    let mut matches = Vec::new();
    for (regex, label) in patterns {
        for m in regex.find_iter(text) {
            matches.push(SensitivityMatch {
                kind: "password".to_string(),
                label: (*label).to_string(),
                level: "critical".to_string(),
                start: byte_to_utf16_offset(text, m.start()),
                end: byte_to_utf16_offset(text, m.end()),
            });
        }
    }
    matches
}
