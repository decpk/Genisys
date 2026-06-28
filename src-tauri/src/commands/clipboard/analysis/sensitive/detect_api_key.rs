use super::super::utf16_offset::byte_to_utf16_offset;
use crate::types::SensitivityMatch;
use regex::Regex;
use std::sync::OnceLock;

/// Detects provider API keys / tokens. Faithful port of the frontend
/// `detectApiKey` sensitive-data detector. All matches are `critical`.
pub fn detect_api_key(text: &str) -> Vec<SensitivityMatch> {
    static PATTERNS: OnceLock<Vec<(Regex, &'static str)>> = OnceLock::new();
    let patterns = PATTERNS.get_or_init(|| {
        vec![
            (Regex::new(r"sk-[a-zA-Z0-9]{20,}").expect("re"), "OpenAI Key"),
            (
                Regex::new(r"sk-proj-[a-zA-Z0-9_\-]{40,}").expect("re"),
                "OpenAI Project Key",
            ),
            (Regex::new(r"ghp_[a-zA-Z0-9]{36,}").expect("re"), "GitHub PAT"),
            (
                Regex::new(r"gho_[a-zA-Z0-9]{36,}").expect("re"),
                "GitHub OAuth",
            ),
            (
                Regex::new(r"github_pat_[a-zA-Z0-9_]{40,}").expect("re"),
                "GitHub Fine-grained PAT",
            ),
            (
                Regex::new(r"glpat-[a-zA-Z0-9\-_]{20,}").expect("re"),
                "GitLab PAT",
            ),
            (
                Regex::new(r"xoxb-[a-zA-Z0-9\-]+").expect("re"),
                "Slack Bot Token",
            ),
            (
                Regex::new(r"xoxp-[a-zA-Z0-9\-]+").expect("re"),
                "Slack User Token",
            ),
            (
                Regex::new(r"xapp-[a-zA-Z0-9\-]+").expect("re"),
                "Slack App Token",
            ),
            (
                Regex::new(r"SG\.[a-zA-Z0-9_\-]{22,}\.[a-zA-Z0-9_\-]{43,}").expect("re"),
                "SendGrid Key",
            ),
            (
                Regex::new(r"sk_live_[a-zA-Z0-9]{24,}").expect("re"),
                "Stripe Secret Key",
            ),
            (
                Regex::new(r"pk_live_[a-zA-Z0-9]{24,}").expect("re"),
                "Stripe Publishable Key",
            ),
            (
                Regex::new(r"rk_live_[a-zA-Z0-9]{24,}").expect("re"),
                "Stripe Restricted Key",
            ),
            (
                Regex::new(r"sq0atp-[a-zA-Z0-9_\-]{22,}").expect("re"),
                "Square Access Token",
            ),
            (Regex::new(r"npm_[a-zA-Z0-9]{36,}").expect("re"), "npm Token"),
            (
                Regex::new(r"pypi-[a-zA-Z0-9_\-]{50,}").expect("re"),
                "PyPI Token",
            ),
            (
                Regex::new(r"hf_[a-zA-Z0-9]{34,}").expect("re"),
                "HuggingFace Token",
            ),
            (
                Regex::new(r"AIza[a-zA-Z0-9_\-]{35}").expect("re"),
                "Google API Key",
            ),
        ]
    });

    let mut matches = Vec::new();
    for (regex, label) in patterns {
        for m in regex.find_iter(text) {
            matches.push(SensitivityMatch {
                kind: "api_key".to_string(),
                label: (*label).to_string(),
                level: "critical".to_string(),
                start: byte_to_utf16_offset(text, m.start()),
                end: byte_to_utf16_offset(text, m.end()),
            });
        }
    }
    matches
}
