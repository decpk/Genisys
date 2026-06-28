use super::super::utf16_offset::byte_to_utf16_offset;
use crate::types::SensitivityMatch;
use regex::Regex;
use std::sync::OnceLock;

/// Detects US SSNs. Faithful port of the frontend `detectSsn` sensitive-data
/// detector.
///
/// NOTE: the TS pattern uses negative lookaheads
/// `\b(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b` which the Rust
/// `regex` crate does not support. The structural pattern is matched first and
/// the lookahead exclusions are applied as a post-filter, which is behaviorally
/// identical.
pub fn detect_ssn(text: &str) -> Vec<SensitivityMatch> {
    static RE: OnceLock<Regex> = OnceLock::new();
    let re =
        RE.get_or_init(|| Regex::new(r"\b\d{3}-\d{2}-\d{4}\b").expect("valid ssn regex"));

    let mut matches = Vec::new();
    for m in re.find_iter(text) {
        let s = m.as_str();
        // s is exactly "ddd-dd-dddd" (ASCII), safe to index by byte.
        let area = &s[0..3];
        let group = &s[4..6];
        let serial = &s[7..11];

        // (?!000|666|9\d{2}) on the area number
        if area == "000" || area == "666" || area.starts_with('9') {
            continue;
        }
        // (?!00) on the group number
        if group == "00" {
            continue;
        }
        // (?!0000) on the serial number
        if serial == "0000" {
            continue;
        }

        matches.push(SensitivityMatch {
            kind: "ssn".to_string(),
            label: "SSN / Tax ID".to_string(),
            level: "critical".to_string(),
            start: byte_to_utf16_offset(text, m.start()),
            end: byte_to_utf16_offset(text, m.end()),
        });
    }
    matches
}
