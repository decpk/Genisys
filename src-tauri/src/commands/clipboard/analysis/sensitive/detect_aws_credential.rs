use super::super::utf16_offset::byte_to_utf16_offset;
use crate::types::SensitivityMatch;
use regex::Regex;
use std::sync::OnceLock;

/// Detects AWS access keys and secret keys. Faithful port of the frontend
/// `detectAwsCredential` sensitive-data detector. Matches are `critical`.
///
/// Access-key matches are emitted before secret-key matches, mirroring the TS
/// detector's ordering.
pub fn detect_aws_credential(text: &str) -> Vec<SensitivityMatch> {
    static ACCESS_KEY: OnceLock<Regex> = OnceLock::new();
    static SECRET_KEY: OnceLock<Regex> = OnceLock::new();

    let access_key =
        ACCESS_KEY.get_or_init(|| Regex::new(r"\bAKIA[A-Z0-9]{16}\b").expect("valid aws-access regex"));
    let secret_key = SECRET_KEY.get_or_init(|| {
        Regex::new(
            r#"(?:aws_secret_access_key|AWS_SECRET_ACCESS_KEY)\s*[:=]\s*['"]?[A-Za-z0-9/+=]{40}['"]?"#,
        )
        .expect("valid aws-secret regex")
    });

    let mut matches = Vec::new();
    for m in access_key.find_iter(text) {
        matches.push(SensitivityMatch {
            kind: "aws_credential".to_string(),
            label: "AWS Access Key".to_string(),
            level: "critical".to_string(),
            start: byte_to_utf16_offset(text, m.start()),
            end: byte_to_utf16_offset(text, m.end()),
        });
    }
    for m in secret_key.find_iter(text) {
        matches.push(SensitivityMatch {
            kind: "aws_credential".to_string(),
            label: "AWS Secret Key".to_string(),
            level: "critical".to_string(),
            start: byte_to_utf16_offset(text, m.start()),
            end: byte_to_utf16_offset(text, m.end()),
        });
    }
    matches
}
