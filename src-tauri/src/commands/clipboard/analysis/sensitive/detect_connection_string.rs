use super::super::utf16_offset::byte_to_utf16_offset;
use crate::types::SensitivityMatch;
use regex::Regex;
use std::sync::OnceLock;

/// Detects database connection strings. Faithful port of the frontend
/// `detectConnectionString` sensitive-data detector. Matches are `critical`.
pub fn detect_connection_string(text: &str) -> Vec<SensitivityMatch> {
    static PATTERNS: OnceLock<Vec<(Regex, &'static str)>> = OnceLock::new();
    let patterns = PATTERNS.get_or_init(|| {
        vec![
            (
                Regex::new(r"(?i)(?:postgres|postgresql)://[^\s]+").expect("re"),
                "PostgreSQL Connection",
            ),
            (
                Regex::new(r"(?i)mongodb(?:\+srv)?://[^\s]+").expect("re"),
                "MongoDB Connection",
            ),
            (
                Regex::new(r"(?i)mysql://[^\s]+").expect("re"),
                "MySQL Connection",
            ),
            (
                Regex::new(r"(?i)redis://[^\s]+").expect("re"),
                "Redis Connection",
            ),
            (
                Regex::new(r"(?i)amqp://[^\s]+").expect("re"),
                "AMQP Connection",
            ),
            (
                Regex::new(
                    r"(?i)Server\s*=\s*[^;]+;\s*Database\s*=\s*[^;]+;\s*(?:User\s*Id|Uid)\s*=\s*[^;]+",
                )
                .expect("re"),
                "SQL Server Connection",
            ),
        ]
    });

    let mut matches = Vec::new();
    for (regex, label) in patterns {
        for m in regex.find_iter(text) {
            matches.push(SensitivityMatch {
                kind: "connection_string".to_string(),
                label: (*label).to_string(),
                level: "critical".to_string(),
                start: byte_to_utf16_offset(text, m.start()),
                end: byte_to_utf16_offset(text, m.end()),
            });
        }
    }
    matches
}
