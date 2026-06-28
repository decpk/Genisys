use super::super::utf16_offset::byte_to_utf16_offset;
use crate::types::SensitivityMatch;
use regex::Regex;
use std::sync::OnceLock;

/// Detects `.env`-style secret assignments. Faithful port of the frontend
/// `detectEnvSecret` sensitive-data detector. Matches are `high`.
pub fn detect_env_secret(text: &str) -> Vec<SensitivityMatch> {
    static RE: OnceLock<Regex> = OnceLock::new();
    let re = RE.get_or_init(|| {
        Regex::new(r"(?im)^(?:(?:DATABASE_URL|DB_PASSWORD|API_KEY|API_SECRET|SECRET_KEY|AUTH_TOKEN|ACCESS_TOKEN|PRIVATE_KEY|ENCRYPTION_KEY|SIGNING_KEY|MASTER_KEY|APP_SECRET|JWT_SECRET|SESSION_SECRET|OAUTH_SECRET|CLIENT_SECRET)\s*=\s*.+)$").expect("valid env-secret regex")
    });

    let mut matches = Vec::new();
    for m in re.find_iter(text) {
        matches.push(SensitivityMatch {
            kind: "env_secret".to_string(),
            label: "Env Secret".to_string(),
            level: "high".to_string(),
            start: byte_to_utf16_offset(text, m.start()),
            end: byte_to_utf16_offset(text, m.end()),
        });
    }
    matches
}
